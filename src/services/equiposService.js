import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  where,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../firebase'
import {
  validarEquipo,
  limpiarEspacios,
  normalizarCodigo,
} from '../utils/validaciones'

// Referencias a las colecciones en Firestore
const equiposRef = collection(db, 'equipos')
const prestamosRef = collection(db, 'prestamos')

// Calcula el estado según el stock y si está en mantenimiento
export function calcularEstado(stockDisponible, enMantenimiento) {
  if (enMantenimiento) return 'Mantenimiento'
  return stockDisponible > 0 ? 'Disponible' : 'Agotado'
}

// READ en tiempo real: avisa cada vez que algo cambia en la nube.
// Devuelve una función para cancelar la escucha.
export function suscribirEquipos(alCambiar, alFallar) {
  const consulta = query(equiposRef, orderBy('nombre'))
  return onSnapshot(
    consulta,
    (snapshot) => {
      const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      alCambiar(lista)
    },
    alFallar,
  )
}

// CREATE: un equipo nuevo empieza con todo su stock disponible
export async function crearEquipo(datos) {
  const errorValidacion = validarEquipo(datos)
  if (errorValidacion) throw new Error(errorValidacion)

  const stockTotal = Number(datos.stockTotal)
  await addDoc(equiposRef, {
    nombre: limpiarEspacios(datos.nombre),
    codigo: normalizarCodigo(datos.codigo),
    categoria: datos.categoria,
    stockTotal,
    stockDisponible: stockTotal,
    estado: calcularEstado(stockTotal, datos.enMantenimiento),
  })
}

// UPDATE: respeta las unidades que están prestadas actualmente
export async function actualizarEquipo(equipoActual, datos) {
  const errorValidacion = validarEquipo(datos)
  if (errorValidacion) throw new Error(errorValidacion)

  const nuevoTotal = Number(datos.stockTotal)
  const prestadas = equipoActual.stockTotal - equipoActual.stockDisponible

  if (nuevoTotal < prestadas) {
    throw new Error(
      `No puedes dejar el stock total en ${nuevoTotal}: hay ${prestadas} unidades prestadas.`,
    )
  }

  const nuevoDisponible = nuevoTotal - prestadas

  await updateDoc(doc(db, 'equipos', equipoActual.id), {
    nombre: limpiarEspacios(datos.nombre),
    codigo: normalizarCodigo(datos.codigo),
    categoria: datos.categoria,
    stockTotal: nuevoTotal,
    stockDisponible: nuevoDisponible,
    estado: calcularEstado(nuevoDisponible, datos.enMantenimiento),
  })
}

// DELETE: no se puede dar de baja un equipo con préstamos pendientes
export async function eliminarEquipo(id) {
  const pendientes = await getDocs(
    query(
      prestamosRef,
      where('equipoId', '==', id),
      where('estado', '==', 'Pendiente'),
    ),
  )
  if (!pendientes.empty) {
    throw new Error(
      `No se puede eliminar: tiene ${pendientes.size} préstamo(s) pendiente(s). Registra primero la devolución.`,
    )
  }
  await deleteDoc(doc(db, 'equipos', id))
}