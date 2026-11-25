import { useEffect } from 'react'
import { ArrowRight, Boxes, Cloud, FlaskConical, Zap } from 'lucide-react'

const caracteristicas = [
    { Icono: Boxes, titulo: 'Inventario organizado', texto: 'Equipos con código, foto y stock siempre al día.' },
    { Icono: Zap, titulo: 'Stock automático', texto: 'Cada préstamo y devolución actualiza las unidades.' },
    { Icono: Cloud, titulo: 'Tiempo real en la nube', texto: 'Datos sincronizados al instante con Firebase.' },
]

export default function Bienvenida({ onEntrar }) {
    // Con la tecla Enter también se puede ingresar
    useEffect(() => {
        const alTeclear = (e) => {
            if (e.key === 'Enter') onEntrar()
        }
        window.addEventListener('keydown', alTeclear)
        return () => window.removeEventListener('keydown', alTeclear)
    }, [onEntrar])

    return (
        <div className="fondo-aurora relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12">
            {/* Esferas de luz decorativas */}
            <div className="anim-float pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
            <div
                className="anim-float pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl"
                style={{ animationDelay: '-3s' }}
            />

            <main className="relative z-10 flex max-w-3xl flex-col items-center text-center">
                <div className="anim-slide-up flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-emerald-400 to-teal-600 shadow-2xl shadow-emerald-900/50">
                    <FlaskConical size={38} className="text-white" />
                </div>

                <p
                    className="anim-slide-up mt-8 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400"
                    style={{ animationDelay: '80ms' }}
                >
                    Panel del Administrador
                </p>
                <h1
                    className="anim-slide-up mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-6xl"
                    style={{ animationDelay: '160ms' }}
                >
                    Control de Préstamos
                    <span className="block bg-linear-to-r from-emerald-300 to-sky-400 bg-clip-text text-transparent">
                        de Laboratorio
                    </span>
                </h1>
                <p
                    className="anim-slide-up mt-5 max-w-xl text-base text-slate-400 sm:text-lg"
                    style={{ animationDelay: '240ms' }}
                >
                    Gestiona el inventario de componentes y registra entregas y devoluciones desde un solo lugar.
                </p>

                <button
                    type="button"
                    onClick={onEntrar}
                    autoFocus
                    className="anim-slide-up group mt-10 inline-flex items-center gap-3 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-900/40 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-800/50 active:translate-y-0"
                    style={{ animationDelay: '320ms' }}
                >
                    Ingresar al sistema
                    <ArrowRight size={22} className="transition-transform group-hover:translate-x-1.5" />
                </button>
                <p
                    className="anim-slide-up mt-3 text-xs text-slate-500"
                    style={{ animationDelay: '380ms' }}
                >
                    o presiona Enter
                </p>

                <div className="mt-14 grid w-full gap-4 sm:grid-cols-3">
                    {caracteristicas.map(({ Icono, titulo, texto }, i) => (
                        <div
                            key={titulo}
                            className="anim-slide-up rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-left backdrop-blur transition hover:-translate-y-1 hover:border-slate-700"
                            style={{ animationDelay: `${440 + i * 90}ms` }}
                        >
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                                <Icono size={20} />
                            </div>
                            <h3 className="font-semibold text-white">{titulo}</h3>
                            <p className="mt-1 text-sm text-slate-400">{texto}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="relative z-10 mt-14 text-center text-xs text-slate-500">
                Universidad Privada del Valle · Ingeniería de Sistemas Informáticos · Base de Datos III
            </footer>
        </div>
    )
}