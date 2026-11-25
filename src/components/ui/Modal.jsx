import { useEffect } from 'react'
import { X } from 'lucide-react'

// Ventana emergente: se cierra con Esc o haciendo clic fuera, y bloquea el scroll del fondo.
// Si "bloquear" es true (por ejemplo mientras se guarda), no se puede cerrar.
export default function Modal({
    titulo,
    subtitulo,
    onCerrar,
    children,
    ancho = 'max-w-lg',
    bloquear = false,
}) {
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

    return (
        <div
            className="anim-fade-in fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !bloquear) onCerrar()
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                className={`anim-pop-in my-auto w-full ${ancho} rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl shadow-black/60`}
            >
                <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-white">{titulo}</h2>
                        {subtitulo && <p className="mt-0.5 text-sm text-slate-400">{subtitulo}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        disabled={bloquear}
                        aria-label="Cerrar"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-40"
                    >
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}