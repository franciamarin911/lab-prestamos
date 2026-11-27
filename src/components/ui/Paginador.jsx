import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TAMANOS_PAGINA } from '../../constants'
import Selector from './Selector'

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

const OPCIONES_TAMANO = TAMANOS_PAGINA.map((n) => ({ valor: n, etiqueta: `${n} por página` }))

// "anclaId" es el id del elemento al que se sube automáticamente al cambiar de página.
export default function Paginador({ paginacion, nombre = 'registros', anclaId }) {
  const { pagina, setPagina, totalPaginas, tamano, setTamano, total, desde, hasta } = paginacion
  if (total === 0) return null

  function subir() {
    // Espera a que se dibuje la nueva página y sube hasta los filtros (o al inicio si no hay ancla)
    requestAnimationFrame(() => {
      const el = anclaId && document.getElementById(anclaId)
      const destino = el ? el.getBoundingClientRect().top + window.scrollY - 100 : 0
      window.scrollTo({ top: Math.max(0, destino), behavior: 'smooth' })
    })
  }

  function irA(n) {
    setPagina(n)
    subir()
  }

  const boton =
    'hover-grad inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:before:opacity-0'

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400">
        <span>
          Mostrando <b className="text-slate-100">{desde}–{hasta}</b> de{' '}
          <b className="text-slate-100">{total}</b> {nombre}
        </span>
        <Selector
          className="w-44"
          etiqueta="Registros por página"
          valor={tamano}
          opciones={OPCIONES_TAMANO}
          onCambio={(n) => {
            setTamano(n)
            subir()
          }}
        />
      </div>

      {totalPaginas > 1 && (
        <nav className="vidrio flex items-center gap-1 rounded-2xl p-1.5" aria-label="Paginación">
          <button
            type="button"
            onClick={() => irA(pagina - 1)}
            disabled={pagina === 1}
            aria-label="Página anterior"
            className={`${boton} text-slate-300`}
          >
            <ChevronLeft size={18} />
          </button>

          {/* Celular: solo "3 / 8" */}
          <span className="px-3 text-sm font-semibold text-slate-200 sm:hidden">
            {pagina} / {totalPaginas}
          </span>

          {/* Pantallas grandes: números */}
          <div className="hidden items-center gap-1 sm:flex">
            {numerosVisibles(pagina, totalPaginas).map((n) =>
              typeof n === 'string' ? (
                <span key={n} className="px-1 text-slate-500">…</span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => irA(n)}
                  aria-current={n === pagina ? 'page' : undefined}
                  className={`${boton} ${
                    n === pagina
                      ? 'bg-linear-to-br from-emerald-400 to-sky-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'text-slate-300'
                  }`}
                >
                  {n}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={() => irA(pagina + 1)}
            disabled={pagina === totalPaginas}
            aria-label="Página siguiente"
            className={`${boton} text-slate-300`}
          >
            <ChevronRight size={18} />
          </button>
        </nav>
      )}
    </div>
  )
}
