import { useState } from 'react'
import { LoaderCircle, Minus, Plus } from 'lucide-react'
import { CATEGORIAS, PREFIJOS } from '../constants'
import {
  mensajeError,
  validarCategoria,
  validarNombreEquipo,
  validarStock,
} from '../utils/validaciones'
import Modal from './ui/Modal'
import Campo from './ui/Campo'
import SubirFoto from './ui/SubirFoto'
import { btnPrimario, btnSecundario, entrada } from './ui/estilos'

export default function EquipoModal({ equipo, onCerrar, onGuardar }) {
  // Si recibe un "equipo" estamos editando; si no, estamos creando
  const editando = Boolean(equipo)

  const [form, setForm] = useState({
    nombre: equipo?.nombre ?? '',
    categoria: equipo?.categoria ?? CATEGORIAS[0],
    stockTotal: equipo?.stockTotal ?? 1,
    enMantenimiento: equipo?.estado === 'Mantenimiento',
    fotoUrl: equipo?.fotoUrl ?? '',
  })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)

  function cambiar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
    setErrores((e) => ({ ...e, [campo]: '' }))
    setErrorGeneral('')
  }

  function ajustarStock(delta) {
    const actual = Number(form.stockTotal)
    const base = Number.isFinite(actual) ? actual : 0
    cambiar('stockTotal', Math.min(9999, Math.max(0, Math.trunc(base) + delta)))
  }

  async function enviar(e) {
    e.preventDefault()
    const nuevos = {
      nombre: validarNombreEquipo(form.nombre),
      categoria: validarCategoria(form.categoria),
      stockTotal: validarStock(form.stockTotal),
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

  const prefijo = PREFIJOS[form.categoria]
  const cambioCategoria = editando && form.categoria !== equipo.categoria

  return (
    <Modal
      titulo={editando ? 'Editar equipo' : 'Nuevo equipo'}
      subtitulo={editando ? equipo.codigo : 'El código se asigna automáticamente'}
      onCerrar={onCerrar}
      bloquear={guardando}
    >
      <form onSubmit={enviar} className="space-y-5 px-6 py-5" noValidate>
        <Campo id="eq-nombre" etiqueta="Nombre" error={errores.nombre} contador={`${form.nombre.length}/60`}>
          <input
            id="eq-nombre"
            className={entrada(errores.nombre)}
            maxLength={60}
            value={form.nombre}
            onChange={(e) => cambiar('nombre', e.target.value)}
            placeholder="Ej. Sensor ultrasónico HC-SR04"
            autoFocus
          />
        </Campo>

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            id="eq-categoria"
            etiqueta="Categoría"
            error={errores.categoria}
            ayuda={
              cambioCategoria
                ? `Al guardar, el código cambiará a ${prefijo}-###.`
                : editando
                  ? undefined
                  : `Código: ${prefijo}-001, ${prefijo}-002…`
            }
          >
            <select
              id="eq-categoria"
              className={entrada(errores.categoria)}
              value={form.categoria}
              onChange={(e) => cambiar('categoria', e.target.value)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Campo>

          <Campo id="eq-stock" etiqueta="Stock total" error={errores.stockTotal}>
            <div className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => ajustarStock(-1)}
                aria-label="Restar una unidad"
                className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 text-slate-300 transition hover:bg-slate-800"
              >
                <Minus size={16} />
              </button>
              <input
                id="eq-stock"
                type="number"
                min="0"
                max="9999"
                step="1"
                className={`${entrada(errores.stockTotal)} text-center`}
                value={form.stockTotal}
                onChange={(e) => cambiar('stockTotal', e.target.value)}
              />
              <button
                type="button"
                onClick={() => ajustarStock(1)}
                aria-label="Sumar una unidad"
                className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 text-slate-300 transition hover:bg-slate-800"
              >
                <Plus size={16} />
              </button>
            </div>
          </Campo>
        </div>

        <Campo etiqueta="Foto (opcional)">
          <SubirFoto
            url={form.fotoUrl}
            onCambio={(url) => cambiar('fotoUrl', url)}
            onOcupado={setSubiendoFoto}
          />
        </Campo>

        {/* Interruptor de mantenimiento */}
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/30 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-200">En mantenimiento</p>
            <p className="text-xs text-slate-500">No se podrá prestar mientras esté activo.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.enMantenimiento}
            onClick={() => cambiar('enMantenimiento', !form.enMantenimiento)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              form.enMantenimiento ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                form.enMantenimiento ? 'left-5.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {errorGeneral && (
          <p className="anim-fade-in rounded-xl bg-red-500/15 px-4 py-2.5 text-sm text-red-300">
            {errorGeneral}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
          <button type="button" onClick={onCerrar} disabled={guardando} className={btnSecundario}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando || subiendoFoto} className={btnPrimario}>
            {guardando && <LoaderCircle size={16} className="animate-spin" />}
            {guardando ? 'Guardando…' : subiendoFoto ? 'Subiendo foto…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}