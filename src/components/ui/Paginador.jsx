import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TAMANOS_PAGINA } from '../../constants'

// Calcula qué números mostrar: 1 … 4 5 6 … 20
function numerosVisibles(actual, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const lista = [1]
    const inicio = Math.max(2, actual - 1)
    const fin = Math.min(total - 1, actual + 1)
    if (inicio > 2) lista.push('puntos-inicio')
    for (let i = inicio; i <= fin; i++) lista.push(i)
    if (fin < total - 1) lista.push('puntos-fin')
    lista.push(total)
    return lista
}

export default function Paginador({ paginacion, nombre = 'registros' }) {
    const { pagina, setPagina, totalPaginas, tamano, setTamano, total, desde, hasta } = paginacion
    if (total === 0) return null

    const boton =
        'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40'

    return (
        <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-3 text-sm text-slate-400">
                <span>
                    Mostrando <b className="text-slate-200">{desde}–{hasta}</b> de{' '}
                    <b className="text-slate-200">{total}</b> {nombre}
                </span>
                <select
                    aria-label="Registros por página"
                    value={tamano}
                    onChange={(e) => setTamano(Number(e.target.value))}
                    className="rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                >
                    {TAMANOS_PAGINA.map((n) => (
                        <option key={n} value={n}>
                            {n} por página
                        </option>
                    ))}
                </select>
            </div>

            {totalPaginas > 1 && (
                <nav className="flex items-center gap-1" aria-label="Paginación">
                    <button
                        type="button"
                        onClick={() => setPagina(pagina - 1)}
                        disabled={pagina === 1}
                        aria-label="Página anterior"
                        className={`${boton} text-slate-300 hover:bg-slate-800`}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    {numerosVisibles(pagina, totalPaginas).map((n) =>
                        typeof n === 'string' ? (
                            <span key={n} className="px-1 text-slate-500">
                                …
                            </span>
                        ) : (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setPagina(n)}
                                aria-current={n === pagina ? 'page' : undefined}
                                className={`${boton} ${n === pagina
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                                        : 'text-slate-300 hover:bg-slate-800'
                                    }`}
                            >
                                {n}
                            </button>
                        ),
                    )}
                    <button
                        type="button"
                        onClick={() => setPagina(pagina + 1)}
                        disabled={pagina === totalPaginas}
                        aria-label="Página siguiente"
                        className={`${boton} text-slate-300 hover:bg-slate-800`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </nav>
            )}
        </div>
    )
}