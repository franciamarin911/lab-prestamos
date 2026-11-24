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

// Referencia a la colección "prestamos" en Firestore
const prestamosRef = collection(db, 'prestamos')

// Calcula cómo queda un equipo cuando le devuelven unidades.
// Nunca supera el stock total, y respeta el estado "Mantenimiento".
function reponerStock(equipo, cantidad) {
  const nuevoDisponible = Math.min(
    equipo.stockDisponible + cantidad,
    equipo.stockTotal,
  )
  const estado =
    equipo.estado === 'Mantenimiento'
      ? 'Mantenimiento'
      : calcularEstado(nuevoDisponible, false)
  return { stockDisponible: nuevoDisponible, estado }
}

// READ en tiempo real: los más recientes primero
export function suscribirPrestamos(alCambiar, alFallar) {
  const consulta = query(prestamosRef, orderBy('fechaPrestamo', 'desc'))
  return onSnapshot(
    consulta,
    (snapshot) => {
      const lista = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data({ serverTimestamps: 'estimate' }),
      }))
      alCambiar(lista)
    },
    alFallar,
  )
}

// CREATE: registra el préstamo y descuenta stock en una sola transacción
export async function crearPrestamo(datos) {
  const cantidad = Number(datos.cantidad)
  const equipoRef = doc(db, 'equipos', datos.equipoId)
  const prestamoRef = doc(prestamosRef) // genera un ID nuevo

  await runTransaction(db, async (tx) => {
    // 1) Leer el equipo (siempre las lecturas van antes que las escrituras)
    const equipoSnap = await tx.get(equipoRef)
    if (!equipoSnap.exists()) {
      throw new Error('El equipo seleccionado ya no existe.')
    }
    const equipo = equipoSnap.data()

    // 2) Validar con los datos más recientes de la nube
    if (equipo.estado === 'Mantenimiento') {
      throw new Error('El equipo está en mantenimiento y no se puede prestar.')
    }
    if (cantidad > equipo.stockDisponible) {
      throw new Error(
        `Solo hay ${equipo.stockDisponible} unidad(es) disponible(s) de ${equipo.nombre}.`,
      )
    }

    // 3) Escribir: descontar stock y crear el préstamo
    const nuevoDisponible = equipo.stockDisponible - cantidad
    tx.update(equipoRef, {
      stockDisponible: nuevoDisponible,
      estado: calcularEstado(nuevoDisponible, false),
    })
    tx.set(prestamoRef, {
      estudiante: datos.estudiante.trim(),
      codigoEstudiante: datos.codigoEstudiante.trim(),
      equipoId: datos.equipoId,
      equipoNombre: equipo.nombre,
      cantidad,
      fechaPrestamo: serverTimestamp(),
      estado: 'Pendiente',
    })
  })
}

// UPDATE (devolución): marca como Devuelto y repone el stock
export async function devolverPrestamo(prestamo) {
  const prestamoRef = doc(db, 'prestamos', prestamo.id)
  const equipoRef = doc(db, 'equipos', prestamo.equipoId)

  await runTransaction(db, async (tx) => {
    const prestamoSnap = await tx.get(prestamoRef)
    const equipoSnap = await tx.get(equipoRef)

    if (!prestamoSnap.exists()) {
      throw new Error('El préstamo ya no existe.')
    }
    const actual = prestamoSnap.data()
    if (actual.estado === 'Devuelto') {
      throw new Error('Este préstamo ya fue devuelto.')
    }

    // Si el equipo aún existe, se le devuelven las unidades
    if (equipoSnap.exists()) {
      tx.update(equipoRef, reponerStock(equipoSnap.data(), actual.cantidad))
    }

    tx.update(prestamoRef, {
      estado: 'Devuelto',
      fechaDevolucion: serverTimestamp(),
    })
  })
}

// UPDATE (corrección): solo los datos del estudiante.
// Equipo y cantidad no se editan para no desajustar el stock.
export async function actualizarPrestamo(id, datos) {
  await updateDoc(doc(db, 'prestamos', id), {
    estudiante: datos.estudiante.trim(),
    codigoEstudiante: datos.codigoEstudiante.trim(),
  })
}

// DELETE: si el préstamo estaba Pendiente, devuelve las unidades al stock
export async function eliminarPrestamo(prestamo) {
  const prestamoRef = doc(db, 'prestamos', prestamo.id)
  const equipoRef = doc(db, 'equipos', prestamo.equipoId)

  await runTransaction(db, async (tx) => {
    const prestamoSnap = await tx.get(prestamoRef)
    const equipoSnap = await tx.get(equipoRef)

    if (!prestamoSnap.exists()) return
    const actual = prestamoSnap.data()

    if (actual.estado === 'Pendiente' && equipoSnap.exists()) {
      tx.update(equipoRef, reponerStock(equipoSnap.data(), actual.cantidad))
    }

    tx.delete(prestamoRef)
  })
}