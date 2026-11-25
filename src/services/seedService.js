import {
    collection,
    doc,
    getDocs,
    limit,
    query,
    where,
    writeBatch,
    Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { PREFIJOS } from '../constants'
import { construirDatosEjemplo } from '../data/datosEjemplo'
import { ultimoNumero } from './equiposService'

const equiposRef = collection(db, 'equipos')
const prestamosRef = collection(db, 'prestamos')

// Cuántos equipos y préstamos se crearán (para mostrarlo antes de confirmar)
export function resumenDatosEjemplo() {
    const { equipos, prestamos } = construirDatosEjemplo()
    return { equipos: equipos.length, prestamos: prestamos.length }
}

// Carga el catálogo y el historial de ejemplo en una sola operación (lote)
export async function cargarDatosEjemplo() {
    const yaCargados = await getDocs(
        query(equiposRef, where('esEjemplo', '==', true), limit(1)),
    )
    if (!yaCargados.empty) {
        throw new Error('Ya hay datos de ejemplo cargados. Elimínalos primero para volver a cargarlos.')
    }

    // Si ya existen códigos reales, los de ejemplo continúan la numeración
    const inicios = {}
    for (const prefijo of Object.values(PREFIJOS)) {
        inicios[prefijo] = await ultimoNumero(prefijo)
    }

    const datos = construirDatosEjemplo(inicios)
    const lote = writeBatch(db)
    const referencias = {}

    datos.equipos.forEach(({ clave, ...equipo }) => {
        const ref = doc(equiposRef)
        referencias[clave] = ref
        lote.set(ref, { ...equipo, fotoUrl: '', esEjemplo: true })
    })

    datos.prestamos.forEach((p) => {
        const ref = doc(prestamosRef)
        lote.set(ref, {
            estudiante: p.estudiante,
            codigoEstudiante: p.codigoEstudiante,
            equipoId: referencias[p.claveEquipo].id,
            equipoNombre: p.equipoNombre,
            cantidad: p.cantidad,
            fechaPrestamo: Timestamp.fromDate(p.fechaPrestamo),
            estado: p.estado,
            ...(p.fechaDevolucion
                ? { fechaDevolucion: Timestamp.fromDate(p.fechaDevolucion) }
                : {}),
            esEjemplo: true,
        })
    })

    await lote.commit()
    return { equipos: datos.equipos.length, prestamos: datos.prestamos.length }
}

// Elimina SOLO los datos de ejemplo (y cualquier préstamo hecho sobre ellos)
export async function eliminarDatosEjemplo() {
    const equiposSnap = await getDocs(query(equiposRef, where('esEjemplo', '==', true)))
    const idsEquipos = new Set(equiposSnap.docs.map((d) => d.id))

    const prestamosSnap = await getDocs(prestamosRef)
    const prestamosBorrar = prestamosSnap.docs.filter(
        (d) => d.data().esEjemplo === true || idsEquipos.has(d.data().equipoId),
    )

    const todos = [...equiposSnap.docs, ...prestamosBorrar]
    for (let i = 0; i < todos.length; i += 400) {
        const lote = writeBatch(db)
        todos.slice(i, i + 400).forEach((d) => lote.delete(d.ref))
        await lote.commit()
    }
    return { equipos: equiposSnap.size, prestamos: prestamosBorrar.length }
}