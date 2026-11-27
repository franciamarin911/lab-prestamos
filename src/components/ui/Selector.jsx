import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'

// Lista desplegable de cristal que reemplaza al <select> normal del navegador.
// opciones = [{ valor, etiqueta, descripcion?, Icono?, color? }]
// Funciona con mouse, toque y teclado (↑ ↓ Enter Esc). El panel se abre hacia arriba si abajo no hay espacio.
export default function Selector({ valor, opciones, onCambio, etiqueta, id, error, className = '' }) {
  const botonRef = useRef(null)
  const panelRef = useRef(null)
  const idLista = useId()
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(0)
  const [pos, setPos] = useState(null)

  const seleccionada = opciones.find((o) => o.valor === valor)
  const indiceSel = Math.max(0, opciones.findIndex((o) => o.valor === valor))

  // Calcula dónde dibujar el panel respecto al botón
  const medir = useCallback(() => {
    const el = botonRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const ancho = Math.max(r.width, 250)
    const izquierda = Math.max(8, Math.min(r.left, window.innerWidth - ancho - 8))
    const espacioAbajo = window.innerHeight - r.bottom - 12
    const espacioArriba = r.top - 12
    const altoIdeal = Math.min(opciones.length * 48 + 14, 340)
    const haciaArriba = espacioAbajo < altoIdeal && espacioArriba > espacioAbajo
    const espacio = haciaArriba ? espacioArriba : espacioAbajo
    setPos({
      left: izquierda,
      width: ancho,
      maxH: Math.max(150, Math.min(340, espacio)),
      top: haciaArriba ? null : r.bottom + 8,
      bottom: haciaArriba ? window.innerHeight - r.top + 8 : null,
    })
  }, [opciones.length])

  useLayoutEffect(() => {
    if (abierto) medir()
  }, [abierto, medir])

  useEffect(() => {
    if (!abierto) return
    const cerrarFuera = (e) => {
      if (botonRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return
      setAbierto(false)
    }
    const reajustar = (e) => {
      if (panelRef.current?.contains(e.target)) return
      medir()
    }
    document.addEventListener('pointerdown', cerrarFuera)
    window.addEventListener('resize', medir)
    window.addEventListener('scroll', reajustar, true)
    return () => {
      document.removeEventListener('pointerdown', cerrarFuera)
      window.removeEventListener('resize', medir)
      window.removeEventListener('scroll', reajustar, true)
    }
  }, [abierto, medir])

  // Mantiene visible la opción resaltada al navegar con el teclado
  useEffect(() => {
    if (!abierto) return
    panelRef.current?.querySelector('[data-activo="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activo, abierto, pos])

  function abrir() {
    setActivo(indiceSel)
    setAbierto(true)
  }

  function elegir(opcion) {
    if (!opcion) return
    onCambio(opcion.valor)
    setAbierto(false)
    botonRef.current?.focus()
  }

  function alTeclear(e) {
    if (!abierto) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        abrir()
      }
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation() // para que no cierre también la ventana donde está el selector
      setAbierto(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActivo((i) => Math.min(opciones.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActivo((i) => Math.max(0, i - 1))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActivo(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActivo(opciones.length - 1)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      elegir(opciones[activo])
    } else if (e.key === 'Tab') {
      setAbierto(false)
    }
  }

  const IconoActual = seleccionada?.Icono

  return (
    <div className={`relative ${className}`}>
      <button
        ref={botonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-label={etiqueta}
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        onKeyDown={alTeclear}
        className={`hover-grad flex w-full items-center gap-2.5 rounded-xl border bg-white/5 px-3.5 py-2.5 text-left text-sm text-slate-100 backdrop-blur transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/30 ${
          abierto
            ? 'border-emerald-400/60 ring-2 ring-emerald-400/20'
            : error
              ? 'border-red-500/60'
              : 'border-white/10 hover:border-emerald-400/40'
        }`}
      >
        {IconoActual && <IconoActual size={16} className={`shrink-0 ${seleccionada.color ?? 'text-slate-400'}`} />}
        <span className="flex-1 truncate">{seleccionada?.etiqueta ?? 'Seleccionar'}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-300 ${abierto ? 'rotate-180 text-emerald-300' : 'text-slate-400'}`}
        />
      </button>

      {abierto &&
        pos &&
        createPortal(
          <ul
            ref={panelRef}
            id={idLista}
            role="listbox"
            aria-label={etiqueta}
            className="anim-pop-in vidrio-fuerte fixed z-[70] overflow-y-auto rounded-2xl p-1.5"
            style={{
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxH,
              top: pos.top ?? undefined,
              bottom: pos.bottom ?? undefined,
            }}
          >
            {opciones.map((o, i) => {
              const seleccionado = o.valor === valor
              const resaltado = i === activo
              const IconoOpcion = o.Icono
              return (
                <li
                  key={String(o.valor)}
                  role="option"
                  aria-selected={seleccionado}
                  data-activo={resaltado}
                  onMouseEnter={() => setActivo(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => elegir(o)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    resaltado
                      ? 'bg-linear-to-r from-emerald-500/25 via-teal-500/15 to-sky-500/10 text-white'
                      : 'text-slate-300'
                  }`}
                >
                  {IconoOpcion && (
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 ${o.color ?? 'text-slate-300'}`}>
                      <IconoOpcion size={16} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{o.etiqueta}</span>
                    {o.descripcion && <span className="block truncate text-xs text-slate-500">{o.descripcion}</span>}
                  </span>
                  {seleccionado && <Check size={16} className="shrink-0 text-emerald-300" />}
                </li>
              )
            })}
          </ul>,
          document.body,
        )}
    </div>
  )
}
