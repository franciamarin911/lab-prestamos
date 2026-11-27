import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Pencil, Plus, Search, Trash2, Undo2 } from 'lucide-react'
import {
  suscribirPrestamos,
  crearPrestamo,
  devolverPrestamo,
  actualizarPrestamo,
  eliminarPrestamo,
} from '../services/prestamosService'
import { suscribirEquipos } from '../services/equiposService'
import { mensajeError } from '../utils/validaciones'
import { diasDesde, formatearFecha, iniciales, normalizar, tiempoRelativo } from '../utils/formato'
import usePaginacion from '../hooks/usePaginacion'
import PrestamoModal from './PrestamoModal'
import ConfirmDialog from './ui/ConfirmDialog'
import EstadoBadge from './ui/EstadoBadge'
import FotoEquipo from './ui/FotoEquipo'
import Paginador from './ui/Paginador'
import { btnIcono, btnPrimario, entrada, tarjeta } from './ui/estilos'

const ESTADOS_FILTRO = ['Todos', 'Pendiente', 'Devuelto']

function Avatar({ nombre }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-500/40 via-sky-500/30 to-violet-500/40 text-xs font-bold text-white ring-1 ring-white/15">
      {iniciales(nombre)}
    </div>
  )
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
  const [eliminando, setEliminando] = useState(false)
  const [devolviendoId, setDevolviendoId] = useState(null)

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
    const cancelarEquipos = suscribirEquipos(setEquipos, (err) => console.error(err))
    return () => {
      cancelarPrestamos()
      cancelarEquipos()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const equiposPorId = useMemo(
    () => Object.fromEntries(equipos.map((e) => [e.id, e])),
    [equipos],
  )

  // Solo se pueden prestar equipos con stock y que no estén en mantenimiento
  const equiposDisponibles = useMemo(
    () => equipos.filter((e) => e.estado !== 'Mantenimiento' && e.stockDisponible > 0),
    [equipos],
  )

  const conteo = useMemo(
    () => ({
      Todos: prestamos.length,
      Pendiente: prestamos.filter((p) => p.estado === 'Pendiente').length,
      Devuelto: prestamos.filter((p) => p.estado === 'Devuelto').length,
    }),
    [prestamos],
  )

  // Búsqueda y filtro
  const filtrados = useMemo(() => {
    const texto = normalizar(busqueda.trim())
    return prestamos.filter((p) => {
      const coincideTexto =
        normalizar(p.estudiante).includes(texto) ||
        normalizar(p.codigoEstudiante).includes(texto) ||
        normalizar(p.equipoNombre).includes(texto)
      const coincideEstado = filtroEstado === 'Todos' || p.estado === filtroEstado
      return coincideTexto && coincideEstado
    })
  }, [prestamos, busqueda, filtroEstado])

  const paginacion = usePaginacion(filtrados, 12, `${busqueda}|${filtroEstado}`)

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
    setDevolviendoId(prestamo.id)
    try {
      await devolverPrestamo(prestamo)
      notificar('Devolución registrada. Stock repuesto.')
    } catch (err) {
      console.error(err)
      notificar(mensajeError(err), 'error')
    }
    setDevolviendoId(null)
  }

  async function confirmarEliminar() {
    setEliminando(true)
    try {
      await eliminarPrestamo(prestamoAEliminar)
      notificar('Préstamo eliminado')
    } catch (err) {
      console.error(err)
      notificar(mensajeError(err), 'error')
    }
    setEliminando(false)
    setPrestamoAEliminar(null)
  }

  // Botones de acción (se usan en la tabla y en las tarjetas de celular)
  function acciones(p) {
    return (
      <>
        {p.estado === 'Pendiente' && (
          <button
            type="button"
            onClick={() => devolver(p)}
            disabled={devolviendoId === p.id}
            className="brillo mr-1 inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-emerald-500/25 to-sky-500/20 px-3 py-2 text-xs font-semibold text-emerald-200 ring-1 ring-inset ring-emerald-400/30 transition hover:from-emerald-500/40 hover:to-sky-500/30 disabled:opacity-50"
          >
            <Undo2 size={14} />
            {devolviendoId === p.id ? 'Devolviendo…' : 'Devolver'}
          </button>
        )}
        <button type="button" onClick={() => abrirEdicion(p)} className={btnIcono} aria-label={`Corregir préstamo de ${p.estudiante}`} title="Corregir datos">
          <Pencil size={16} />
        </button>
        <button
          type="button"
          onClick={() => setPrestamoAEliminar(p)}
          className={`${btnIcono} hover:!text-red-300`}
          aria-label={`Eliminar préstamo de ${p.estudiante}`}
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      </>
    )
  }

  return (
    <section>
      {/* Barra de herramientas (al cambiar de página se sube hasta aquí) */}
      <div id="lista-prestamos" className="mb-6 grid scroll-mt-28 gap-3 lg:flex lg:flex-wrap lg:items-center">
        <div className="relative lg:min-w-64 lg:flex-1">
          <Search size={16} className="pointer-events-none absolute z-10 left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className={entrada(false, { relleno: 'pl-10 pr-3.5' })}
            placeholder="Buscar por estudiante, CI o equipo…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar préstamos"
          />
        </div>

        {/* Filtro por estado con contador */}
        <div className="vidrio flex overflow-x-auto rounded-xl p-1">
          {ESTADOS_FILTRO.map((estado) => (
            <button
              key={estado}
              type="button"
              onClick={() => setFiltroEstado(estado)}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                filtroEstado === estado
                  ? 'bg-linear-to-br from-emerald-400 to-sky-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:bg-linear-to-r hover:from-emerald-500/10 hover:to-sky-500/10 hover:text-white'
              }`}
            >
              {estado}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  filtroEstado === estado ? 'bg-white/25' : 'bg-white/10 text-slate-300'
                }`}
              >
                {conteo[estado]}
              </span>
            </button>
          ))}
        </div>

        <button type="button" onClick={abrirNuevo} className={btnPrimario}>
          <Plus size={18} /> Nuevo préstamo
        </button>
      </div>

      {/* Cargando */}
      {cargando && (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {!cargando && filtrados.length === 0 && (
        <div className={`${tarjeta} anim-fade-in flex flex-col items-center px-6 py-16 text-center`}>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
            <ClipboardList size={30} />
          </div>
          <h3 className="text-lg font-semibold text-white">
            {prestamos.length === 0 ? 'Aún no hay préstamos' : 'Sin resultados'}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-400">
            {prestamos.length === 0
              ? 'Registra la primera entrega de un equipo del laboratorio.'
              : 'Ningún préstamo coincide con tu búsqueda o filtro.'}
          </p>
          {prestamos.length === 0 && (
            <button type="button" onClick={abrirNuevo} className={`${btnPrimario} mt-5`}>
              <Plus size={18} /> Nuevo préstamo
            </button>
          )}
        </div>
      )}

      {/* Tabla (pantallas medianas y grandes) */}
      {!cargando && filtrados.length > 0 && (
        <div className={`${tarjeta} anim-fade-in hidden overflow-x-auto md:block`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Estudiante</th>
                <th className="px-4 py-3 font-semibold">CI</th>
                <th className="px-4 py-3 font-semibold">Equipo</th>
                <th className="px-4 py-3 font-semibold">Cant.</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginacion.items.map((p, i) => {
                const atrasado = p.estado === 'Pendiente' && diasDesde(p.fechaPrestamo) >= 7
                return (
                  <tr
                    key={p.id}
                    className="anim-fade-in border-t border-white/5 transition hover:bg-linear-to-r hover:from-emerald-500/10 hover:via-transparent hover:to-sky-500/10"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar nombre={p.estudiante} />
                        <span className="font-medium text-white">{p.estudiante}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.codigoEstudiante}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FotoEquipo equipo={equiposPorId[p.equipoId]} ancho={100} iconSize={16} className="h-9 w-9 shrink-0 rounded-lg" />
                        <span className="text-slate-200">{p.equipoNombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-200">{p.cantidad}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="text-slate-300">{formatearFecha(p.fechaPrestamo)}</p>
                      <p className={`text-xs ${atrasado ? 'text-amber-400' : 'text-slate-500'}`}>
                        {tiempoRelativo(p.fechaPrestamo)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={p.estado} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {acciones(p)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tarjetas (celular) */}
      {!cargando && filtrados.length > 0 && (
        <div className="space-y-3 md:hidden">
          {paginacion.items.map((p, i) => {
            const atrasado = p.estado === 'Pendiente' && diasDesde(p.fechaPrestamo) >= 7
            return (
              <div
                key={p.id}
                className={`${tarjeta} anim-slide-up p-4`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  <Avatar nombre={p.estudiante} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{p.estudiante}</p>
                    <p className="font-mono text-xs text-slate-500">CI {p.codigoEstudiante}</p>
                  </div>
                  <EstadoBadge estado={p.estado} />
                </div>
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[0.04] p-2.5">
                  <FotoEquipo equipo={equiposPorId[p.equipoId]} ancho={100} iconSize={16} className="h-10 w-10 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-100">{p.equipoNombre}</p>
                    <p className={`text-xs ${atrasado ? 'text-amber-400' : 'text-slate-500'}`}>
                      × {p.cantidad} · {tiempoRelativo(p.fechaPrestamo)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-end gap-1">
                  {acciones(p)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!cargando && <Paginador paginacion={paginacion} nombre="préstamos" anclaId="lista-prestamos" />}

      {/* Modal de crear / corregir */}
      {modalAbierto && (
        <PrestamoModal
          prestamo={prestamoEditando}
          equiposDisponibles={equiposDisponibles}
          equipoActual={prestamoEditando ? equiposPorId[prestamoEditando.equipoId] : undefined}
          onCerrar={cerrarModal}
          onGuardar={guardar}
        />
      )}

      {/* Confirmación de eliminación */}
      {prestamoAEliminar && (
        <ConfirmDialog
          titulo="¿Eliminar préstamo?"
          peligro
          textoConfirmar="Sí, eliminar"
          cargando={eliminando}
          onConfirmar={confirmarEliminar}
          onCancelar={() => setPrestamoAEliminar(null)}
        >
          <p>
            Se eliminará el préstamo de <b className="text-white">{prestamoAEliminar.estudiante}</b> (
            {prestamoAEliminar.equipoNombre} × {prestamoAEliminar.cantidad}).
          </p>
          {prestamoAEliminar.estado === 'Pendiente' && (
            <p className="rounded-lg bg-amber-500/15 px-3 py-2 text-amber-300">
              Como está pendiente, las unidades volverán al stock.
            </p>
          )}
        </ConfirmDialog>
      )}
    </section>
  )
}
