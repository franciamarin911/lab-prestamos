import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Ventana emergente de cristal.
// - Se dibuja directamente en <body> (portal), por eso SIEMPRE queda centrada en la pantalla.
// - En celular sube desde abajo; si el contenido es largo, se desplaza dentro de la ventana.
// - Se cierra con Esc o haciendo clic fuera. Si "bloquear" es true (guardando), no se puede cerrar.
export default function Modal({
  titulo,
  subtitulo,
  onCerrar,
  children,
  ancho = 'max-w-lg',
  bloquear = false,
  pie = null,
}) {
  // Acepta atajos de tamaño: 'sm' | 'md' | 'lg' o una clase completa como 'max-w-4xl'
  const ALIAS = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }
  const claseAncho = ALIAS[ancho] ?? ancho

  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === 'Escape' && !bloquear) onCerrar()
    }
    document.addEventListener('keydown', alTeclear)
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = anterior
    }
  }, [onCerrar, bloquear])

  return createPortal(
    <div
      className="anim-fade-in fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-md sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !bloquear) onCerrar()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`anim-dialogo vidrio-fuerte flex max-h-[92dvh] w-full ${claseAncho} flex-col overflow-hidden rounded-t-3xl sm:max-h-[90dvh] sm:rounded-3xl`}
      >
        <div className="relative flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-6 py-4">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/70 to-transparent" />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-white">{titulo}</h2>
            {subtitulo && <p className="mt-0.5 truncate text-sm text-slate-400">{subtitulo}</p>}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={bloquear}
            aria-label="Cerrar"
            className="hover-grad rounded-xl p-2 text-slate-400 transition hover:text-white disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {pie && (
          <div className="shrink-0 border-t border-white/10 bg-slate-950/30 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {pie}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
