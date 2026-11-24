import { useEffect, useState } from 'react'
import {
  suscribirEquipos,
  crearEquipo,
  actualizarEquipo,
  eliminarEquipo,
} from '../services/equiposService'
import { CATEGORIAS, ESTADOS_EQUIPO } from '../constants'
import EquipoModal from './EquipoModal'
import { mensajeError } from '../utils/validaciones'

const colorEstado = {
  Disponible: 'bg-emerald-500/20 text-emerald-300',
  Agotado: 'bg-red-500/20 text-red-300',
  Mantenimiento: 'bg-slate-500/30 text-slate-300',
}

export default function Inventario({ notificar }) {
  const [equipos, setEquipos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [equipoEditando, setEquipoEditando] = useState(null)
  const [equipoAEliminar, setEquipoAEliminar] = useState(null)

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

  // Filtros de búsqueda
  const texto = busqueda.trim().toLowerCase()
  const equiposFiltrados = equipos.filter((e) => {
    const coincideTexto =
      (e.nombre ?? '').toLowerCase().includes(texto) ||
      (e.codigo ?? '').toLowerCase().includes(texto)
    const coincideCategoria =
      filtroCategoria === 'Todas' || e.categoria === filtroCategoria
    const coincideEstado = filtroEstado === 'Todos' || e.estado === filtroEstado
    return coincideTexto && coincideCategoria && coincideEstado
  })

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
    // Evita códigos repetidos (ignora el propio equipo si se está editando)
    const repetido = equipos.some(
      (e) =>
        (e.codigo ?? '').toLowerCase() === datos.codigo.trim().toLowerCase() &&
        e.id !== equipoEditando?.id,
    )
    if (repetido) {
      throw new Error('Ya existe un equipo con ese código.')
    }

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
    try {
      await eliminarEquipo(equipoAEliminar.id)
      notificar('Equipo eliminado')
    } catch (err) {
      console.error(err)
      notificar(mensajeError(err), 'error')
    }
    setEquipoAEliminar(null)
  }

  const control =
    'rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500'

  return (
    <section>
      {/* Barra de búsqueda y filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className={`${control} min-w-[200px] flex-1`}
          placeholder="Buscar por nombre o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select
          className={control}
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="Todas">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className={control}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="Todos">Todos los estados</option>
          {ESTADOS_EQUIPO.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={abrirNuevo}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500"
        >
          + Nuevo equipo
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Disponible / Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-slate-400">
                  Cargando inventario...
                </td>
              </tr>
            )}
            {!cargando && equiposFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-slate-400">
                  No hay equipos para mostrar.
                </td>
              </tr>
            )}
            {equiposFiltrados.map((e) => (
              <tr key={e.id} className="border-t border-slate-800">
                <td className="px-4 py-3 font-medium">{e.nombre}</td>
                <td className="px-4 py-3 text-slate-400">{e.codigo}</td>
                <td className="px-4 py-3">{e.categoria}</td>
                <td className="px-4 py-3">
                  {e.stockDisponible} / {e.stockTotal}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      colorEstado[e.estado] ?? ''
                    }`}
                  >
                    {e.estado}
                  </span>
                </td>
                <td className="space-x-2 px-4 py-3 text-right">
                  <button
                    onClick={() => abrirEdicion(e)}
                    className="rounded-lg px-3 py-1 text-sky-300 hover:bg-slate-800"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setEquipoAEliminar(e)}
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

      {/* Modal de crear / editar */}
      {modalAbierto && (
        <EquipoModal
          equipo={equipoEditando}
          onCerrar={cerrarModal}
          onGuardar={guardar}
        />
      )}

      {/* Confirmación de eliminación */}
      {equipoAEliminar && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">¿Eliminar equipo?</h2>
            <p className="text-slate-300">
              Se eliminará <strong>{equipoAEliminar.nombre}</strong> (
              {equipoAEliminar.codigo}). Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEquipoAEliminar(null)}
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