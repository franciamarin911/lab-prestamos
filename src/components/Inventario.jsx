import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, List, PackageSearch, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import {
  suscribirEquipos,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo,
} from '../services/equiposService'
import { CATEGORIAS, ESTADOS_EQUIPO } from '../constants'
import { mensajeError } from '../utils/validaciones'
import { normalizar } from '../utils/formato'
import usePaginacion from '../hooks/usePaginacion'
import EquipoModal from './EquipoModal'
import ConfirmDialog from './ui/ConfirmDialog'
import EstadoBadge from './ui/EstadoBadge'
import FotoEquipo, { IconoCategoria } from './ui/FotoEquipo'
import Paginador from './ui/Paginador'
import { btnIcono, btnPrimario, entrada, tarjeta } from './ui/estilos'

const ORDENES = {
  nombre: 'Nombre (A-Z)',
  codigo: 'Código',
  stock: 'Menor stock disponible',
}

const colorBarra = {
  Disponible: 'bg-emerald-400',
  Agotado: 'bg-red-400',
  Mantenimiento: 'bg-slate-400',
}

function BarraStock({ equipo }) {
  const total = Number(equipo.stockTotal) || 0
  const disponible = Number(equipo.stockDisponible) || 0
  const porcentaje = total > 0 ? Math.round((disponible / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-400">Disponibles</span>
        <span className="font-semibold text-slate-200">
          {disponible} / {total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorBarra[equipo.estado] ?? 'bg-slate-400'}`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  )
}

function TarjetaEquipo({ equipo, indice, onEditar, onEliminar }) {
  return (
    <article
      className={`${tarjeta} anim-slide-up group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:border-slate-600 hover:shadow-xl hover:shadow-black/30`}
      style={{ animationDelay: `${(indice % 12) * 40}ms` }}
    >
      <div className="relative">
        <FotoEquipo equipo={equipo} className="h-36 w-full" iconSize={44} />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-medium text-slate-200 backdrop-blur">
          <IconoCategoria categoria={equipo.categoria} size={13} />
          {equipo.categoria}
        </span>
        <span className="absolute right-3 top-3">
          <EstadoBadge estado={equipo.estado} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 font-semibold leading-snug text-white">{equipo.nombre}</h3>
          <p className="mt-0.5 font-mono text-xs text-slate-500">{equipo.codigo}</p>
        </div>
        <BarraStock equipo={equipo} />
        <div className="mt-auto flex justify-end gap-1 border-t border-slate-800 pt-3">
          <button type="button" onClick={() => onEditar(equipo)} className={btnIcono} aria-label={`Editar ${equipo.nombre}`} title="Editar">
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => onEliminar(equipo)}
            className={`${btnIcono} hover:bg-red-500/10 hover:text-red-400`}
            aria-label={`Eliminar ${equipo.nombre}`}
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}

export default function Inventario({ notificar }) {
  const [equipos, setEquipos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [orden, setOrden] = useState('nombre')
  const [vista, setVista] = useState('tarjetas')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [equipoEditando, setEquipoEditando] = useState(null)
  const [equipoAEliminar, setEquipoAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)

  // Escucha en tiempo real: se activa al abrir y se cancela al salir
  useEffect(() => {
    const cancelar = suscribirEquipos(
      (lista) => {
        setEquipos(lista)
        setCargando(false)
      },
      (err) => {
        console.error(err)
        setCargando(false)
        notificar('No se pudo leer Firestore. Revisa tus reglas y tu .env', 'error')
      },
    )
    return cancelar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Búsqueda, filtros y orden
  const filtrados = useMemo(() => {
    const texto = normalizar(busqueda.trim())
    const lista = equipos.filter((e) => {
      const coincideTexto =
        normalizar(e.nombre).includes(texto) || normalizar(e.codigo).includes(texto)
      const coincideCategoria = filtroCategoria === 'Todas' || e.categoria === filtroCategoria
      const coincideEstado = filtroEstado === 'Todos' || e.estado === filtroEstado
      return coincideTexto && coincideCategoria && coincideEstado
    })
    if (orden === 'codigo') {
      lista.sort((a, b) => String(a.codigo).localeCompare(String(b.codigo), 'es', { numeric: true }))
    } else if (orden === 'stock') {
      lista.sort((a, b) => (Number(a.stockDisponible) || 0) - (Number(b.stockDisponible) || 0))
    } else {
      lista.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'))
    }
    return lista
  }, [equipos, busqueda, filtroCategoria, filtroEstado, orden])

  const paginacion = usePaginacion(
    filtrados,
    12,
    `${busqueda}|${filtroCategoria}|${filtroEstado}|${orden}|${vista}`,
  )

  const hayFiltros = busqueda || filtroCategoria !== 'Todas' || filtroEstado !== 'Todos'

  function limpiarFiltros() {
    setBusqueda('')
    setFiltroCategoria('Todas')
    setFiltroEstado('Todos')
  }

  function abrirNuevo() {
    setEquipoEditando(null)
    setModalAbierto(true)
  }

  function abrirEdicion(equipo) {
    setEquipoEditando(equipo)
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false)
    setEquipoEditando(null)
  }

  async function guardar(datos) {
    if (equipoEditando) {
      await actualizarEquipo(equipoEditando, datos)
      notificar('Equipo actualizado correctamente')
    } else {
      await crearEquipo(datos)
      notificar('Equipo registrado correctamente')
    }
    cerrarModal()
  }

  async function confirmarEliminar() {
    setEliminando(true)
    try {
      await eliminarEquipo(equipoAEliminar.id)
      notificar('Equipo eliminado')
    } catch (err) {
      console.error(err)
      notificar(mensajeError(err), 'error')
    }
    setEliminando(false)
    setEquipoAEliminar(null)
  }

  return (
    <section>
      {/* Barra de herramientas */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className={entrada(false, { relleno: 'pl-10 pr-3.5' })}
            placeholder="Buscar por nombre o código…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar equipos"
          />
        </div>
        <select className={entrada(false, { ancho: 'w-auto' })} value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} aria-label="Filtrar por categoría">
          <option value="Todas">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className={entrada(false, { ancho: 'w-auto' })} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} aria-label="Filtrar por estado">
          <option value="Todos">Todos los estados</option>
          {ESTADOS_EQUIPO.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className={entrada(false, { ancho: 'w-auto' })} value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar por">
          {Object.entries(ORDENES).map(([clave, texto]) => (
            <option key={clave} value={clave}>{texto}</option>
          ))}
        </select>

        {/* Cambio de vista */}
        <div className="flex rounded-xl border border-slate-700 bg-slate-800/60 p-1">
          {[
            ['tarjetas', LayoutGrid, 'Vista de tarjetas'],
            ['tabla', List, 'Vista de tabla'],
          ].map(([id, Icono, etiqueta]) => (
            <button
              key={id}
              type="button"
              onClick={() => setVista(id)}
              aria-label={etiqueta}
              title={etiqueta}
              className={`rounded-lg p-2 transition ${
                vista === id ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icono size={16} />
            </button>
          ))}
        </div>

        <button type="button" onClick={abrirNuevo} className={btnPrimario}>
          <Plus size={18} /> Nuevo equipo
        </button>
      </div>

      {/* Cargando */}
      {cargando && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton h-72 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {!cargando && filtrados.length === 0 && (
        <div className={`${tarjeta} anim-fade-in flex flex-col items-center px-6 py-14 text-center`}>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
            <PackageSearch size={28} />
          </div>
          <h3 className="text-lg font-semibold text-white">
            {equipos.length === 0 ? 'Aún no hay equipos' : 'Sin resultados'}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-400">
            {equipos.length === 0
              ? 'Registra tu primer equipo o carga el catálogo de ejemplo desde la pestaña Ajustes.'
              : 'Ningún equipo coincide con tu búsqueda o filtros.'}
          </p>
          <div className="mt-5">
            {equipos.length === 0 ? (
              <button type="button" onClick={abrirNuevo} className={btnPrimario}>
                <Plus size={18} /> Registrar equipo
              </button>
            ) : (
              hayFiltros && (
                <button type="button" onClick={limpiarFiltros} className={btnPrimario}>
                  Limpiar filtros
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Vista de tarjetas */}
      {!cargando && filtrados.length > 0 && vista === 'tarjetas' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginacion.items.map((e, i) => (
            <TarjetaEquipo key={e.id} equipo={e} indice={i} onEditar={abrirEdicion} onEliminar={setEquipoAEliminar} />
          ))}
        </div>
      )}

      {/* Vista de tabla */}
      {!cargando && filtrados.length > 0 && vista === 'tabla' && (
        <div className={`${tarjeta} anim-fade-in overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Equipo</th>
                <th className="px-4 py-3 font-semibold">Código</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Disponible / Total</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginacion.items.map((e) => (
                <tr key={e.id} className="border-t border-slate-800/70 transition hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FotoEquipo equipo={e} ancho={120} iconSize={18} className="h-10 w-10 shrink-0 rounded-lg" />
                      <span className="font-medium text-white">{e.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.codigo}</td>
                  <td className="px-4 py-3 text-slate-300">{e.categoria}</td>
                  <td className="px-4 py-3 text-slate-200">
                    {e.stockDisponible} / {e.stockTotal}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={e.estado} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button type="button" onClick={() => abrirEdicion(e)} className={btnIcono} aria-label={`Editar ${e.nombre}`} title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEquipoAEliminar(e)}
                      className={`${btnIcono} hover:bg-red-500/10 hover:text-red-400`}
                      aria-label={`Eliminar ${e.nombre}`}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!cargando && <Paginador paginacion={paginacion} nombre="equipos" />}

      {/* Modal de crear / editar */}
      {modalAbierto && (
        <EquipoModal equipo={equipoEditando} onCerrar={cerrarModal} onGuardar={guardar} />
      )}

      {/* Confirmación de eliminación */}
      {equipoAEliminar && (
        <ConfirmDialog
          titulo="¿Eliminar equipo?"
          peligro
          textoConfirmar="Sí, eliminar"
          cargando={eliminando}
          onConfirmar={confirmarEliminar}
          onCancelar={() => setEquipoAEliminar(null)}
        >
          <p>
            Se eliminará <b className="text-white">{equipoAEliminar.nombre}</b> (
            {equipoAEliminar.codigo}). Esta acción no se puede deshacer.
          </p>
        </ConfirmDialog>
      )}
    </section>
  )
}