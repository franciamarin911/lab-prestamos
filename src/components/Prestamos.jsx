import { useEffect, useState } from 'react'
import {
  suscribirPrestamos,
  crearPrestamo,
  devolverPrestamo,
  actualizarPrestamo,
  eliminarPrestamo,
} from '../services/prestamosService'
import { suscribirEquipos } from '../services/equiposService'
import PrestamoModal from './PrestamoModal'

const colorEstado = {
  Pendiente: 'bg-amber-500/20 text-amber-300',
  Devuelto: 'bg-emerald-500/20 text-emerald-300',
}

function formatearFecha(fecha) {
  if (!fecha || typeof fecha.toDate !== 'function') return '...'
  return fecha.toDate().toLocaleString('es-BO', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export default function Prestamos({ notificar }) {
  const [prestamos, setPrestamos] = useState([])
  const [equipos, setEquipos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [prestamoEditando, setPrestamoEditando] = useState(null)
  const [prestamoAEliminar, setPrestamoAEliminar] = useState(null)

  // Escucha en tiempo real de préstamos y de equipos
  useEffect(() => {
    const cancelarPrestamos = suscribirPrestamos(
      (lista) => {
        setPrestamos(lista)
        setCargando(false)
      },
      (err) => {
        console.error(err)
        setCargando(false)
        notificar('No se pudo leer los préstamos de Firestore', 'error')
      },
    )
    const cancelarEquipos = suscribirEquipos(setEquipos, (err) =>
      console.error(err),
    )
    return () => {
      cancelarPrestamos()
      cancelarEquipos()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Solo se pueden prestar equipos con stock y que no estén en mantenimiento
  const equiposDisponibles = equipos.filter(
    (e) => e.estado !== 'Mantenimiento' && e.stockDisponible > 0,
  )

  // Búsqueda y filtro
  const texto = busqueda.trim().toLowerCase()
  const prestamosFiltrados = prestamos.filter((p) => {
    const coincideTexto =
      (p.estudiante ?? '').toLowerCase().includes(texto) ||
      (p.codigoEstudiante ?? '').toLowerCase().includes(texto) ||
      (p.equipoNombre ?? '').toLowerCase().includes(texto)
    const coincideEstado = filtroEstado === 'Todos' || p.estado === filtroEstado
    return coincideTexto && coincideEstado
  })

  function abrirNuevo() {
    setPrestamoEditando(null)
    setModalAbierto(true)
  }

  function abrirEdicion(prestamo) {
    setPrestamoEditando(prestamo)
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false)
    setPrestamoEditando(null)
  }

  async function guardar(datos) {
    if (prestamoEditando) {
      await actualizarPrestamo(prestamoEditando.id, datos)
      notificar('Préstamo actualizado correctamente')
    } else {
      await crearPrestamo(datos)
      notificar('Préstamo registrado correctamente')
    }
    cerrarModal()
  }

  async function devolver(prestamo) {
    try {
      await devolverPrestamo(prestamo)
      notificar('Devolución registrada. Stock repuesto.')
    } catch (err) {
      console.error(err)
      notificar(err.message, 'error')
    }
  }

  async function confirmarEliminar() {
    try {
      await eliminarPrestamo(prestamoAEliminar)
      notificar('Préstamo eliminado')
    } catch (err) {
      console.error(err)
      notificar('No se pudo eliminar el préstamo', 'error')
    }
    setPrestamoAEliminar(null)
  }

  const control =
    'rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500'

  return (
    <section>
      {/* Barra de búsqueda y filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className={`${control} min-w-[200px] flex-1`}
          placeholder="Buscar por estudiante, código o equipo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select
          className={control}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="Todos">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Devuelto">Devuelto</option>
        </select>
        <button
          onClick={abrirNuevo}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500"
        >
          + Nuevo préstamo
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Estudiante</th>
              <th className="px-4 py-3">Matrícula / CI</th>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3">Cant.</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-slate-400">
                  Cargando préstamos...
                </td>
              </tr>
            )}
            {!cargando && prestamosFiltrados.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-slate-400">
                  No hay préstamos para mostrar.
                </td>
              </tr>
            )}
            {prestamosFiltrados.map((p) => (
              <tr key={p.id} className="border-t border-slate-800">
                <td className="px-4 py-3 font-medium">{p.estudiante}</td>
                <td className="px-4 py-3 text-slate-400">{p.codigoEstudiante}</td>
                <td className="px-4 py-3">{p.equipoNombre}</td>
                <td className="px-4 py-3">{p.cantidad}</td>
                <td className="px-4 py-3 text-slate-400">
                  {formatearFecha(p.fechaPrestamo)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      colorEstado[p.estado] ?? ''
                    }`}
                  >
                    {p.estado}
                  </span>
                </td>
                <td className="space-x-2 whitespace-nowrap px-4 py-3 text-right">
                  {p.estado === 'Pendiente' && (
                    <button
                      onClick={() => devolver(p)}
                      className="rounded-lg px-3 py-1 text-emerald-300 hover:bg-slate-800"
                    >
                      Devolver
                    </button>
                  )}
                  <button
                    onClick={() => abrirEdicion(p)}
                    className="rounded-lg px-3 py-1 text-sky-300 hover:bg-slate-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setPrestamoAEliminar(p)}
                    className="rounded-lg px-3 py-1 text-red-300 hover:bg-slate-800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de crear / corregir */}
      {modalAbierto && (
        <PrestamoModal
          prestamo={prestamoEditando}
          equiposDisponibles={equiposDisponibles}
          onCerrar={cerrarModal}
          onGuardar={guardar}
        />
      )}

      {/* Confirmación de eliminación */}
      {prestamoAEliminar && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">¿Eliminar préstamo?</h2>
            <p className="text-slate-300">
              Se eliminará el préstamo de{' '}
              <strong>{prestamoAEliminar.estudiante}</strong> (
              {prestamoAEliminar.equipoNombre} x{prestamoAEliminar.cantidad}).
            </p>
            {prestamoAEliminar.estado === 'Pendiente' && (
              <p className="rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-300">
                Como está pendiente, las unidades volverán al stock.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPrestamoAEliminar(null)}
                className="rounded-lg px-4 py-2 text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}