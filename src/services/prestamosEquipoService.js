import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'

// Escucha en tiempo real SOLO los préstamos de un equipo (para la vista de detalle)
export function suscribirPrestamosDeEquipo(equipoId, alCambiar, alFallar) {
  const consulta = query(collection(db, 'prestamos'), where('equipoId', '==', equipoId))
  return onSnapshot(
    consulta,
    (snapshot) => {
      const lista = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data({ serverTimestamps: 'estimate' }),
      }))
      // Más recientes primero (se ordena aquí para no necesitar un índice en Firebase)
      lista.sort(
        (a, b) => (b.fechaPrestamo?.toMillis?.() ?? 0) - (a.fechaPrestamo?.toMillis?.() ?? 0),
      )
      alCambiar(lista)
    },
    alFallar,
  )
}
