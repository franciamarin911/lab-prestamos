import { useEffect, useRef, useState } from 'react'
import { Boxes, ClipboardList, PackageCheck, PackageX } from 'lucide-react'
import { suscribirEquipos } from '../services/equiposService'
import { suscribirPrestamos } from '../services/prestamosService'
import Inclinable from './ui/Inclinable'
import { tarjeta } from './ui/estilos'

// Anima un número desde su valor anterior hasta el nuevo
function useContador(objetivo, duracion = 700) {
  const [valor, setValor] = useState(0)
  const anterior = useRef(0)
  useEffect(() => {
    const inicio = anterior.current
    const t0 = performance.now()
    let cuadro
    const paso = (t) => {
      const p = Math.min(1, (t - t0) / duracion)
      const v = Math.round(inicio + (objetivo - inicio) * (1 - Math.pow(1 - p, 3)))
      anterior.current = v
      setValor(v)
      if (p < 1) cuadro = requestAnimationFrame(paso)
    }
    cuadro = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(cuadro)
  }, [objetivo, duracion])
  return valor
}

function Tarjeta({ titulo, valor, detalle, Icono, cargando, indice, color }) {
  const animado = useContador(cargando ? 0 : valor)
  return (
    <div className="anim-slide-up" style={{ animationDelay: `${indice * 80}ms` }}>
      <Inclinable className={`${tarjeta} group relative h-full overflow-hidden p-4 sm:p-5`}>
        <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-25 blur-2xl transition-opacity duration-500 group-hover:opacity-50 ${color.brillo}`} />
        <div className="relative flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-slate-400 sm:text-sm">{titulo}</p>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${color.icono}`}>
            <Icono size={19} />
          </div>
        </div>
        {cargando ? (
          <div className="skeleton relative mt-3 h-9 w-20 rounded-lg" />
        ) : (
          <p className={`relative mt-2 text-3xl font-extrabold tabular-nums sm:text-4xl ${color.texto}`}>{animado}</p>
        )}
        <p className="relative mt-1 text-xs text-slate-500">{cargando ? 'Cargando…' : detalle}</p>
      </Inclinable>
    </div>
  )
}

export default function Dashboard() {
  // null = todavía no llegaron los datos
  const [equipos, setEquipos] = useState(null)
  const [prestamos, setPrestamos] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const cancelarEquipos = suscribirEquipos(setEquipos, (err) => {
      console.error(err)
      setError(true)
    })
    const cancelarPrestamos = suscribirPrestamos(setPrestamos, (err) => {
      console.error(err)
      setError(true)
    })
    return () => {
      cancelarEquipos()
      cancelarPrestamos()
    }
  }, [])

  const cargando = equipos === null || prestamos === null
  const num = (v) => Number(v) || 0

  const listaEquipos = equipos ?? []
  const pendientes = (prestamos ?? []).filter((p) => p.estado === 'Pendiente')

  const totalEquipos = listaEquipos.length
  const unidadesTotales = listaEquipos.reduce((s, e) => s + num(e.stockTotal), 0)
  const unidadesPrestadas = pendientes.reduce((s, p) => s + num(p.cantidad), 0)
  const estudiantes = new Set(pendientes.map((p) => p.codigoEstudiante)).size
  const agotados = listaEquipos.filter((e) => e.estado === 'Agotado').length
  const porcentajeUso =
    unidadesTotales > 0 ? Math.min(100, Math.round((unidadesPrestadas / unidadesTotales) * 100)) : 0

  const tarjetas = [
    {
      titulo: 'Total de equipos',
      valor: totalEquipos,
      detalle: `${unidadesTotales} unidades en total`,
      Icono: Boxes,
      color: { texto: 'text-emerald-300', icono: 'bg-emerald-500/15 text-emerald-300', brillo: 'bg-emerald-400' },
    },
    {
      titulo: 'Unidades prestadas',
      valor: unidadesPrestadas,
      detalle: 'Fuera del laboratorio ahora',
      Icono: PackageCheck,
      color: { texto: 'text-sky-300', icono: 'bg-sky-500/15 text-sky-300', brillo: 'bg-sky-400' },
    },
    {
      titulo: 'Préstamos pendientes',
      valor: pendientes.length,
      detalle: `${estudiantes} estudiante(s) con equipos`,
      Icono: ClipboardList,
      color: { texto: 'text-amber-300', icono: 'bg-amber-500/15 text-amber-300', brillo: 'bg-amber-400' },
    },
    {
      titulo: 'Equipos agotados',
      valor: agotados,
      detalle: 'Sin unidades disponibles',
      Icono: PackageX,
      color: { texto: 'text-red-300', icono: 'bg-red-500/15 text-red-300', brillo: 'bg-red-400' },
    },
  ]

  return (
    <section className="mb-10">
      {error && (
        <p className="mb-3 rounded-xl bg-red-500/15 px-4 py-2.5 text-sm text-red-300">
          No se pudieron cargar las métricas. Revisa tu conexión y las reglas de Firestore.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {tarjetas.map((t, i) => (
          <Tarjeta key={t.titulo} {...t} cargando={cargando} indice={i} />
        ))}
      </div>

      {/* Barra de uso global del inventario */}
      {!cargando && unidadesTotales > 0 && (
        <div className={`${tarjeta} anim-slide-up mt-4 px-5 py-4`} style={{ animationDelay: '340ms' }}>
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
            <span className="font-medium text-slate-300">Uso del inventario</span>
            <span className="text-slate-400">
              <b className="text-slate-100">{unidadesPrestadas}</b> de {unidadesTotales} unidades prestadas ({porcentajeUso}%)
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="anim-grow-bar h-full rounded-full bg-linear-to-r from-emerald-400 via-teal-400 to-sky-400 shadow-[0_0_14px_rgba(52,211,153,0.6)]"
              style={{ width: `${porcentajeUso}%` }}
            />
          </div>
        </div>
      )}
    </section>
  )
}
