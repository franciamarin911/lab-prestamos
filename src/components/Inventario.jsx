import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownAZ,
  CircleCheck,
  Hash,
  Layers,
  LayoutGrid,
  List,
  PackageSearch,
  PackageX,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wrench,
} from 'lucide-react'
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
import DetalleEquipo from './DetalleEquipo'
import ConfirmDialog from './ui/ConfirmDialog'
import EstadoBadge from './ui/EstadoBadge'
import FotoEquipo, { CATEGORIAS_UI, IconoCategoria } from './ui/FotoEquipo'
import Inclinable from './ui/Inclinable'
import Paginador from './ui/Paginador'
import Selector from './ui/Selector'
import { btnIcono, btnPrimario, entrada, tarjeta } from './ui/estilos'

const OPCIONES_CATEGORIA = [
  { valor: 'Todas', etiqueta: 'Todas las categorías', Icono: Layers, color: 'text-slate-300' },
  ...CATEGORIAS.map((c) => ({
    valor: c,
    etiqueta: c,
    Icono: CATEGORIAS_UI[c]?.Icono,
    color: CATEGORIAS_UI[c]?.color,
  })),
]

const OPCIONES_ESTADO = [
  { valor: 'Todos', etiqueta: 'Todos los estados', Icono: Layers, color: 'text-slate-300' },
  ...ESTADOS_EQUIPO.map((s) => ({
    valor: s,
    etiqueta: s,
    Icono: s === 'Disponible' ? CircleCheck : s === 'Agotado' ? PackageX : Wrench,
    color: s === 'Disponible' ? 'text-emerald-300' : s === 'Agotado' ? 'text-red-300' : 'text-slate-300',
  })),
]

const OPCIONES_ORDEN = [
  { valor: 'nombre', etiqueta: 'Nombre (A-Z)', Icono: ArrowDownAZ, color: 'text-sky-300' },
  { valor: 'codigo', etiqueta: 'Código', Icono: Hash, color: 'text-violet-300' },
  { valor: 'stock', etiqueta: 'Menor stock disponible', Icono: PackageX, color: 'text-amber-300' },
]

const colorBarra = {
  Disponible: 'from-emerald-400 to-teal-400',
  Agotado: 'from-red-400 to-rose-400',
  Mantenimiento: 'from-slate-400 to-slate-500',
}

function BarraStock({ equipo }) {
  const total = Number(equipo.stockTotal) || 0
  const disponible = Number(equipo.stockDisponible) || 0
  const porcentaje = total > 0 ? Math.round((disponible / total) * 100) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-slate-400">Disponibles</span>
        <span className="font-semibold text-slate-100">
          {disponible} / {total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-linear-to-r transition-all duration-700 ${colorBarra[equipo.estado] ?? 'from-slate-400 to-slate-500'}`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  )
}

function TarjetaEquipo({ equipo, indice, onAbrir, onEditar, onEliminar }) {
  return (
    <div className="anim-slide-up" style={{ animationDelay: `${(indice % 12) * 45}ms` }}>
      <Inclinable className={`${tarjeta} group flex h-full flex-col overflow-hidden`}>
        <div className="relative">
          <FotoEquipo equipo={equipo} ajuste="contener" iconSize={52} className="aspect-[4/3] w-full" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 px-2.5 py-1 text-xs font-medium text-slate-100 backdrop-blur">
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
          <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
            <span className="texto-aurora text-xs font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Ver detalle →
            </span>
            <div className="relative z-10 flex gap-1">
              <button type="button" onClick={() => onEditar(equipo)} className={btnIcono} aria-label={`Editar ${equipo.nombre}`} title="Editar">
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => onEliminar(equipo)}
                className={`${btnIcono} hover:!text-red-300`}
                aria-label={`Eliminar ${equipo.nombre}`}
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
        {/* Toda la tarjeta es clicable (los botones de arriba quedan por encima) */}
        <button
          type="button"
          onClick={() => onAbrir(equipo)}
          aria-label={`Ver detalle de ${equipo.nombre}`}
          className="absolute inset-0 z-[1] cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-emerald-400"
        />
      </Inclinable>
    </div>
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
  const [detalleId, setDetalleId] = useState(null)
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

  // El detalle siempre muestra los datos más recientes del equipo
  const equipoDetalle = detalleId ? equipos.find((e) => e.id === detalleId) : null

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
    setDetalleId(null)
    setEquipoEditando(equipo)
    setModalAbierto(true)
  }

  function cerrarModal() {
    setModalAbierto(false)
    setEquipoEditando(null)
  }

  function pedirEliminar(equipo) {
    setDetalleId(null)
    setEquipoAEliminar(equipo)
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

  // En celular la tabla no cabe: se usan siempre tarjetas
  const mostrarTabla = vista === 'tabla'

  return (
    <section>
      {/* Barra de herramientas (al cambiar de página se sube hasta aquí) */}
      <div id="lista-inventario" className="mb-6 grid scroll-mt-28 grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
        <div className="relative sm:col-span-2 lg:min-w-64 lg:flex-1">
          <Search size={16} className="pointer-events-none absolute z-10 left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className={entrada(false, { relleno: 'pl-10 pr-3.5' })}
            placeholder="Buscar por nombre o código…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar equipos"
          />
        </div>
        <Selector className="col-span-1 lg:w-56" etiqueta="Filtrar por categoría" valor={filtroCategoria} opciones={OPCIONES_CATEGORIA} onCambio={setFiltroCategoria} />
        <Selector className="col-span-1 lg:w-52" etiqueta="Filtrar por estado" valor={filtroEstado} opciones={OPCIONES_ESTADO} onCambio={setFiltroEstado} />
        <Selector className="sm:col-span-1 lg:w-56" etiqueta="Ordenar por" valor={orden} opciones={OPCIONES_ORDEN} onCambio={setOrden} />

        {/* Cambio de vista (solo pantallas medianas y grandes) */}
        <div className="vidrio hidden rounded-xl p-1 md:flex">
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
              className={`rounded-lg p-2.5 transition ${
                vista === id
                  ? 'bg-linear-to-br from-emerald-400 to-sky-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icono size={16} />
            </button>
          ))}
        </div>

        <button type="button" onClick={abrirNuevo} className={`${btnPrimario} sm:col-span-2 lg:col-auto`}>
          <Plus size={18} /> Nuevo equipo
        </button>
      </div>

      {/* Cargando */}
      {cargando && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton h-80 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Sin resultados */}
      {!cargando && filtrados.length === 0 && (
        <div className={`${tarjeta} anim-fade-in flex flex-col items-center px-6 py-16 text-center`}>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
            <PackageSearch size={30} />
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

      {/* Tarjetas (siempre en celular; en pantallas grandes si se eligió esa vista) */}
      {!cargando && filtrados.length > 0 && (
        <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${mostrarTabla ? 'md:hidden' : ''}`}>
          {paginacion.items.map((e, i) => (
            <TarjetaEquipo key={e.id} equipo={e} indice={i} onAbrir={(x) => setDetalleId(x.id)} onEditar={abrirEdicion} onEliminar={pedirEliminar} />
          ))}
        </div>
      )}

      {/* Vista de tabla */}
      {!cargando && filtrados.length > 0 && mostrarTabla && (
        <div className={`${tarjeta} anim-fade-in hidden overflow-x-auto md:block`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
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
                <tr
                  key={e.id}
                  onClick={() => setDetalleId(e.id)}
                  className="cursor-pointer border-t border-white/5 transition hover:bg-linear-to-r hover:from-emerald-500/10 hover:via-transparent hover:to-sky-500/10"
                >
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
                  <td className="whitespace-nowrap px-4 py-3 text-right" onClick={(ev) => ev.stopPropagation()}>
                    <button type="button" onClick={() => abrirEdicion(e)} className={btnIcono} aria-label={`Editar ${e.nombre}`} title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => pedirEliminar(e)}
                      className={`${btnIcono} hover:!text-red-300`}
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

      {!cargando && <Paginador paginacion={paginacion} nombre="equipos" anclaId="lista-inventario" />}

      {/* Vista detallada */}
      {equipoDetalle && (
        <DetalleEquipo
          equipo={equipoDetalle}
          onCerrar={() => setDetalleId(null)}
          onEditar={abrirEdicion}
          onEliminar={pedirEliminar}
        />
      )}

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
