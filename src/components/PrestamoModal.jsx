import { useMemo, useState } from 'react'
import { LoaderCircle, Minus, Plus, Search } from 'lucide-react'
import {
  validarCantidad,
  validarCI,
  validarNombrePersona,
  mensajeError,
} from '../utils/validaciones'
import { normalizar } from '../utils/formato'
import Modal from './ui/Modal'
import Campo from './ui/Campo'
import FotoEquipo from './ui/FotoEquipo'
import { btnPrimario, btnSecundario, entrada } from './ui/estilos'

const botonCantidad =
  'hover-grad rounded-xl border border-white/10 bg-white/5 px-3 text-slate-300 transition hover:border-emerald-400/40 hover:text-white'

// Sirve para dos casos:
// - Crear: "prestamo" es null y se elige equipo y cantidad.
// - Editar: "prestamo" trae datos y solo se corrigen los del estudiante.
export default function PrestamoModal({
  prestamo,
  equiposDisponibles,
  equipoActual,
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
  const [busquedaEquipo, setBusquedaEquipo] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  const equipoElegido = equiposDisponibles.find((e) => e.id === form.equipoId)

  const opciones = useMemo(() => {
    const texto = normalizar(busquedaEquipo.trim())
    return equiposDisponibles.filter(
      (e) => normalizar(e.nombre).includes(texto) || normalizar(e.codigo).includes(texto),
    )
  }, [equiposDisponibles, busquedaEquipo])

  function cambiar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
    setErrores((e) => ({ ...e, [campo]: '' }))
    setErrorGeneral('')
  }

  function elegirEquipo(id) {
    setForm((f) => ({ ...f, equipoId: id, cantidad: 1 }))
    setErrores((e) => ({ ...e, equipoId: '', cantidad: '' }))
  }

  function ajustarCantidad(delta) {
    const maximo = equipoElegido?.stockDisponible ?? 9999
    const actual = Number(form.cantidad)
    const base = Number.isFinite(actual) ? Math.trunc(actual) : 1
    cambiar('cantidad', Math.min(maximo, Math.max(1, base + delta)))
  }

  async function enviar(e) {
    e.preventDefault()
    const nuevos = {
      estudiante: validarNombrePersona(form.estudiante),
      codigoEstudiante: validarCI(form.codigoEstudiante),
    }
    if (!editando) {
      nuevos.equipoId = equipoElegido ? '' : 'Debes seleccionar un equipo disponible.'
      nuevos.cantidad = validarCantidad(form.cantidad, equipoElegido?.stockDisponible ?? 9999)
    }
    setErrores(nuevos)
    if (Object.values(nuevos).some(Boolean)) return

    if (!navigator.onLine) {
      setErrorGeneral('Sin conexión a internet. Conéctate e inténtalo de nuevo.')
      return
    }

    setGuardando(true)
    try {
      await onGuardar(form)
    } catch (err) {
      setErrorGeneral(mensajeError(err))
      setGuardando(false)
    }
  }

  return (
    <Modal
      titulo={editando ? 'Corregir datos del préstamo' : 'Nuevo préstamo'}
      subtitulo={editando ? 'Equipo y cantidad no se pueden modificar' : 'Registra la entrega de un equipo'}
      onCerrar={onCerrar}
      bloquear={guardando}
      ancho="max-w-xl"
    >
      <form onSubmit={enviar} className="space-y-5 px-6 pb-0 pt-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo id="pr-estudiante" etiqueta="Nombre completo del estudiante" error={errores.estudiante}>
            <input
              id="pr-estudiante"
              className={entrada(errores.estudiante)}
              maxLength={60}
              value={form.estudiante}
              onChange={(e) => cambiar('estudiante', e.target.value.replace(/[^\p{L}\s'-]/gu, ''))}
              placeholder="Ej. Juan Pérez Mamani"
              autoFocus
            />
          </Campo>
          <Campo id="pr-ci" etiqueta="CI (solo números)" error={errores.codigoEstudiante}>
            <input
              id="pr-ci"
              className={entrada(errores.codigoEstudiante)}
              inputMode="numeric"
              maxLength={10}
              value={form.codigoEstudiante}
              onChange={(e) => cambiar('codigoEstudiante', e.target.value.replace(/\D/g, ''))}
              placeholder="Ej. 1234567"
            />
          </Campo>
        </div>

        {editando ? (
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <FotoEquipo equipo={equipoActual} ancho={120} iconSize={20} className="h-12 w-12 shrink-0 rounded-lg" />
            <div className="min-w-0">
              <p className="truncate font-medium text-white">{prestamo.equipoNombre}</p>
              <p className="text-xs text-slate-400">Cantidad prestada: {prestamo.cantidad}</p>
            </div>
          </div>
        ) : (
          <>
            <Campo id="pr-buscar" etiqueta="Equipo a prestar" error={errores.equipoId}>
              {equiposDisponibles.length === 0 ? (
                <p className="rounded-xl bg-amber-500/15 px-4 py-3 text-sm text-amber-300">
                  No hay equipos disponibles para prestar.
                </p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                  <div className="relative border-b border-white/10">
                    <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="pr-buscar"
                      className="w-full bg-transparent py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none"
                      placeholder="Filtrar por nombre o código…"
                      value={busquedaEquipo}
                      onChange={(e) => setBusquedaEquipo(e.target.value)}
                    />
                  </div>
                  <ul className="max-h-52 divide-y divide-white/5 overflow-y-auto" role="listbox" aria-label="Equipos disponibles">
                    {opciones.length === 0 && (
                      <li className="px-4 py-4 text-center text-sm text-slate-500">Sin coincidencias.</li>
                    )}
                    {opciones.map((eq) => {
                      const activo = eq.id === form.equipoId
                      return (
                        <li key={eq.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={activo}
                            onClick={() => elegirEquipo(eq.id)}
                            className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${
                              activo
                                ? 'bg-linear-to-r from-emerald-500/25 via-teal-500/10 to-transparent'
                                : 'hover:bg-linear-to-r hover:from-emerald-500/10 hover:to-sky-500/5'
                            }`}
                          >
                            <FotoEquipo equipo={eq} ancho={100} iconSize={16} className="h-9 w-9 shrink-0 rounded-lg" />
                            <div className="min-w-0 flex-1">
                              <p className={`truncate text-sm font-medium ${activo ? 'text-emerald-200' : 'text-slate-100'}`}>
                                {eq.nombre}
                              </p>
                              <p className="font-mono text-xs text-slate-500">{eq.codigo}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-200">
                              {eq.stockDisponible} disp.
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </Campo>

            <Campo
              id="pr-cantidad"
              etiqueta="Cantidad"
              error={errores.cantidad}
              ayuda={equipoElegido ? `Máximo disponible: ${equipoElegido.stockDisponible}` : undefined}
            >
              <div className="flex max-w-48 items-stretch gap-2">
                <button type="button" onClick={() => ajustarCantidad(-1)} aria-label="Restar una unidad" className={botonCantidad}>
                  <Minus size={16} />
                </button>
                <input
                  id="pr-cantidad"
                  type="number"
                  min="1"
                  step="1"
                  max={equipoElegido?.stockDisponible}
                  className={`${entrada(errores.cantidad)} text-center`}
                  value={form.cantidad}
                  onChange={(e) => cambiar('cantidad', e.target.value)}
                />
                <button type="button" onClick={() => ajustarCantidad(1)} aria-label="Sumar una unidad" className={botonCantidad}>
                  <Plus size={16} />
                </button>
              </div>
            </Campo>
          </>
        )}

        {errorGeneral && (
          <p className="anim-fade-in rounded-xl bg-red-500/15 px-4 py-2.5 text-sm text-red-300">
            {errorGeneral}
          </p>
        )}

        {/* Barra de acciones: siempre visible al final de la ventana */}
        <div className="sticky bottom-0 -mx-6 flex justify-end gap-2 border-t border-white/10 bg-slate-900/90 px-6 py-4 backdrop-blur">
          <button type="button" onClick={onCerrar} disabled={guardando} className={btnSecundario}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando || (!editando && equiposDisponibles.length === 0)}
            className={btnPrimario}
          >
            {guardando && <LoaderCircle size={16} className="animate-spin" />}
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
