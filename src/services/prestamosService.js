import {
  collection,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { calcularEstado } from './equiposService'
import { validarEstudiante, validarCantidad, limpiarEspacios } from '../utils/validaciones'

const prestamosRef = collection(db, 'prestamos')

function reponerStock(equipo, cantidad) {
  const nuevoDisponible = Math.min(equipo.stockDisponible + cantidad, equipo.stockTotal)
  const estado = equipo.estado === 'Mantenimiento' ? 'Mantenimiento' : calcularEstado(nuevoDisponible, false)
  return { stockDisponible: nuevoDisponible, estado }
}

export function suscribirPrestamos(alCambiar, alFallar) {
  const consulta = query(prestamosRef, orderBy('fechaPrestamo', 'desc'))
  return onSnapshot(
    consulta,
    (snapshot) => {
      const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }))
      alCambiar(lista)
    },
    alFallar,
  )
}

export async function crearPrestamo(datos) {
  const errorEstudiante = validarEstudiante(datos)
  if (errorEstudiante) throw new Error(errorEstudiante)
  const errorCantidad = validarCantidad(datos.cantidad)
  if (errorCantidad) throw new Error(errorCantidad)
  if (!datos.equipoId) throw new Error('Debes seleccionar un equipo.')
  const cantidad = Number(datos.cantidad)
  const equipoRef = doc(db, 'equipos', datos.equipoId)
  const prestamoRef = doc(prestamosRef)
  await runTransaction(db, async (tx) => {
    const equipoSnap = await tx.get(equipoRef)
    if (!equipoSnap.exists()) throw new Error('El equipo seleccionado ya no existe.')
    const equipo = equipoSnap.data()
    if (equipo.estado === 'Mantenimiento') throw new Error('El equipo está en mantenimiento y no se puede prestar.')
    if (cantidad > equipo.stockDisponible) throw new Error(`Solo hay ${equipo.stockDisponible} unidad(es) disponible(s) de ${equipo.nombre}.`)
    const nuevoDisponible = equipo.stockDisponible - cantidad
    tx.update(equipoRef, { stockDisponible: nuevoDisponible, estado: calcularEstado(nuevoDisponible, false) })
    tx.set(prestamoRef, {
      estudiante: limpiarEspacios(datos.estudiante),
      codigoEstudiante: String(datos.codigoEstudiante).trim(),
      equipoId: datos.equipoId,
      equipoNombre: equipo.nombre,
      cantidad,
      fechaPrestamo: serverTimestamp(),
      estado: 'Pendiente',
    })
  })
}

export async function devolverPrestamo(prestamo) {
  const prestamoRef = doc(db, 'prestamos', prestamo.id)
  const equipoRef = doc(db, 'equipos', prestamo.equipoId)
  await runTransaction(db, async (tx) => {
    const prestamoSnap = await tx.get(prestamoRef)
    const equipoSnap = await tx.get(equipoRef)
    if (!prestamoSnap.exists()) throw new Error('El préstamo ya no existe.')
    const actual = prestamoSnap.data()
    if (actual.estado === 'Devuelto') throw new Error('Este préstamo ya fue devuelto.')
    if (equipoSnap.exists()) tx.update(equipoRef, reponerStock(equipoSnap.data(), actual.cantidad))
    tx.update(prestamoRef, { estado: 'Devuelto', fechaDevolucion: serverTimestamp() })
  })
}

export async function actualizarPrestamo(id, datos) {
  const errorEstudiante = validarEstudiante(datos)
  if (errorEstudiante) throw new Error(errorEstudiante)
  await updateDoc(doc(db, 'prestamos', id), {
    estudiante: limpiarEspacios(datos.estudiante),
    codigoEstudiante: String(datos.codigoEstudiante).trim(),
  })
}

export async function eliminarPrestamo(prestamo) {
  const prestamoRef = doc(db, 'prestamos', prestamo.id)
  const equipoRef = doc(db, 'equipos', prestamo.equipoId)
  await runTransaction(db, async (tx) => {
    const prestamoSnap = await tx.get(prestamoRef)
    const equipoSnap = await tx.get(equipoRef)
    if (!prestamoSnap.exists()) return
    const actual = prestamoSnap.data()
    if (actual.estado === 'Pendiente' && equipoSnap.exists()) tx.update(equipoRef, reponerStock(equipoSnap.data(), actual.cantidad))
    tx.delete(prestamoRef)
  })
}
