import { useState } from 'react'
import { CATEGORIAS } from '../constants'
import { validarEquipo, mensajeError } from '../utils/validaciones'

export default function EquipoModal({ equipo, onCerrar, onGuardar }) {
  // Si recibe un "equipo" estamos editando; si no, estamos creando
  const [form, setForm] = useState({
    nombre: equipo?.nombre ?? '',
    codigo: equipo?.codigo ?? '',
    categoria: equipo?.categoria ?? CATEGORIAS[0],
    stockTotal: equipo?.stockTotal ?? 1,
    enMantenimiento: equipo?.estado === 'Mantenimiento',
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  function cambiar(campo, valor) {
    setForm({ ...form, [campo]: valor })
  }

  async function enviar(e) {
    e.preventDefault()
    setError('')

    const mensaje = validarEquipo(form)
    if (mensaje) {
      setError(mensaje)
      return
    }
    if (!navigator.onLine) {
      setError('Sin conexión a internet. Conéctate e inténtalo de nuevo.')
      return
    }

    setGuardando(true)
    try {
      await onGuardar(form)
    } catch (err) {
      setError(mensajeError(err))
      setGuardando(false)
    }
  }

  const campo =
    'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500'

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
      <form
        onSubmit={enviar}
        className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
        <h2 className="text-xl font-bold">
          {equipo ? 'Editar equipo' : 'Nuevo equipo'}
        </h2>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Nombre</label>
          <input
            className={campo}
            maxLength={60}
            value={form.nombre}
            onChange={(e) => cambiar('nombre', e.target.value)}
            placeholder="Ej. Sensor HC-SR04"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">
            Código (letras, números y guiones)
          </label>
          <input
            className={campo}
            maxLength={20}
            value={form.codigo}
            onChange={(e) =>
              cambiar('codigo', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))
            }
            placeholder="Ej. LAB-SEN-01"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Categoría</label>
          <select
            className={campo}
            value={form.categoria}
            onChange={(e) => cambiar('categoria', e.target.value)}
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Stock total</label>
          <input
            type="number"
            min="0"
            max="9999"
            step="1"
            className={campo}
            value={form.stockTotal}
            onChange={(e) => cambiar('stockTotal', e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={form.enMantenimiento}
            onChange={(e) => cambiar('enMantenimiento', e.target.checked)}
          />
          Marcar en mantenimiento
        </label>

        {error && (
          <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg px-4 py-2 text-slate-300 hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}