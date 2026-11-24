import { useState } from 'react'
import {
  validarEstudiante,
  validarCantidad,
  mensajeError,
} from '../utils/validaciones'

// Sirve para dos casos:
// - Crear: "prestamo" es null y se elige equipo y cantidad.
// - Editar: "prestamo" trae datos y solo se corrigen los del estudiante.
export default function PrestamoModal({
  prestamo,
  equiposDisponibles,
  onCerrar,
  onGuardar,
}) {
  const editando = Boolean(prestamo)

  const [form, setForm] = useState({
    estudiante: prestamo?.estudiante ?? '',
    codigoEstudiante: prestamo?.codigoEstudiante ?? '',
    equipoId: prestamo?.equipoId ?? equiposDisponibles[0]?.id ?? '',
    cantidad: prestamo?.cantidad ?? 1,
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const equipoElegido = equiposDisponibles.find((e) => e.id === form.equipoId)

  function cambiar(campo, valor) {
    setForm({ ...form, [campo]: valor })
  }

  async function enviar(e) {
    e.preventDefault()
    setError('')

    const errorEstudiante = validarEstudiante(form)
    if (errorEstudiante) {
      setError(errorEstudiante)
      return
    }

    if (!editando) {
      if (!form.equipoId || !equipoElegido) {
        setError('Debes seleccionar un equipo disponible.')
        return
      }
      const errorCantidad = validarCantidad(
        form.cantidad,
        equipoElegido.stockDisponible,
      )
      if (errorCantidad) {
        setError(errorCantidad)
        return
      }
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
    'w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500 disabled:opacity-50'

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
      <form
        onSubmit={enviar}
        className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
        <h2 className="text-xl font-bold">
          {editando ? 'Corregir datos del préstamo' : 'Nuevo préstamo'}
        </h2>

        <div>
          <label className="mb-1 block text-sm text-slate-400">
            Nombre completo del estudiante
          </label>
          <input
            className={campo}
            maxLength={60}
            value={form.estudiante}
            onChange={(e) =>
              cambiar('estudiante', e.target.value.replace(/[^\p{L}\s'-]/gu, ''))
            }
            placeholder="Ej. Juan Pérez Mamani"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">
            CI (solo números)
          </label>
          <input
            className={campo}
            inputMode="numeric"
            maxLength={10}
            value={form.codigoEstudiante}
            onChange={(e) =>
              cambiar('codigoEstudiante', e.target.value.replace(/\D/g, ''))
            }
            placeholder="Ej. 1234567"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Equipo</label>
          {editando ? (
            <input className={campo} value={prestamo.equipoNombre} disabled />
          ) : equiposDisponibles.length === 0 ? (
            <p className="rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-300">
              No hay equipos disponibles para prestar.
            </p>
          ) : (
            <select
              className={campo}
              value={form.equipoId}
              onChange={(e) =>
                setForm({ ...form, equipoId: e.target.value, cantidad: 1 })
              }
            >
              {equiposDisponibles.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nombre} ({eq.codigo}) — disp: {eq.stockDisponible}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Cantidad</label>
          <input
            type="number"
            min="1"
            step="1"
            max={equipoElegido?.stockDisponible}
            className={campo}
            value={form.cantidad}
            onChange={(e) => cambiar('cantidad', e.target.value)}
            disabled={editando}
          />
        </div>

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
            disabled={guardando || (!editando && equiposDisponibles.length === 0)}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}