import { CircleCheck, CircleX, Info, X } from 'lucide-react'

const estilos = {
  exito: { Icono: CircleCheck, color: 'text-emerald-300', brillo: 'from-emerald-500/30' },
  error: { Icono: CircleX, color: 'text-red-300', brillo: 'from-red-500/30' },
  info: { Icono: Info, color: 'text-sky-300', brillo: 'from-sky-500/30' },
}

// Avisos de cristal que aparecen arriba a la derecha y se apilan
export default function Toasts({ toasts, onCerrar }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-4 z-[80] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:top-6"
    >
      {toasts.map((t) => {
        const { Icono, color, brillo } = estilos[t.tipo] ?? estilos.exito
        return (
          <div
            key={t.id}
            className="anim-toast-in vidrio-fuerte pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl p-3.5 sm:w-auto"
          >
            <div className={`absolute inset-y-0 left-0 w-24 bg-linear-to-r ${brillo} to-transparent`} />
            <Icono size={20} className={`relative mt-0.5 shrink-0 ${color}`} />
            <p className="relative flex-1 text-sm text-slate-100">{t.mensaje}</p>
            <button
              type="button"
              onClick={() => onCerrar(t.id)}
              aria-label="Cerrar aviso"
              className="relative text-slate-500 transition hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
