import { CircleCheck, CircleX, Info, X } from 'lucide-react'

const estilos = {
    exito: { Icono: CircleCheck, color: 'text-emerald-400', borde: 'border-emerald-500/30' },
    error: { Icono: CircleX, color: 'text-red-400', borde: 'border-red-500/30' },
    info: { Icono: Info, color: 'text-sky-400', borde: 'border-sky-500/30' },
}

// Avisos que aparecen arriba a la derecha y se apilan
export default function Toasts({ toasts, onCerrar }) {
    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:top-6"
        >
            {toasts.map((t) => {
                const { Icono, color, borde } = estilos[t.tipo] ?? estilos.exito
                return (
                    <div
                        key={t.id}
                        className={`anim-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border ${borde} bg-slate-900/95 p-3.5 shadow-2xl shadow-black/50 backdrop-blur sm:w-auto`}
                    >
                        <Icono size={20} className={`mt-0.5 shrink-0 ${color}`} />
                        <p className="flex-1 text-sm text-slate-100">{t.mensaje}</p>
                        <button
                            type="button"
                            onClick={() => onCerrar(t.id)}
                            aria-label="Cerrar aviso"
                            className="text-slate-500 transition hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}