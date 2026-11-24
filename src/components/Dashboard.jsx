import { useEffect, useState } from 'react'
import { suscribirEquipos } from '../services/equiposService'
import { suscribirPrestamos } from '../services/prestamosService'

function Tarjeta({ titulo, valor, detalle, borde, texto }) {
  return (
    <div className={`rounded-2xl border border-slate-800 border-l-4 bg-slate-900 p-4 ${borde}`}>
      <p className="text-sm text-slate-400">{titulo}</p>
      <p className={`mt-1 text-3xl font-bold ${texto}`}>{valor}</p>
      <p className="mt-1 text-xs text-slate-500">{detalle}</p>
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

  const mostrar = (n) => (cargando ? '…' : n)

  return (
    <section className="mb-6">
      {error && (
        <p className="mb-3 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-300">
          No se pudieron cargar las métricas. Revisa tu conexión y las reglas de Firestore.
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tarjeta
          titulo="Total de equipos"
          valor={mostrar(totalEquipos)}
          detalle={cargando ? 'Cargando...' : `${unidadesTotales} unidades en total`}
          borde="border-l-emerald-500"
          texto="text-emerald-300"
        />
        <Tarjeta
          titulo="Unidades prestadas"
          valor={mostrar(unidadesPrestadas)}
          detalle="Unidades que están fuera del laboratorio"
          borde="border-l-sky-500"
          texto="text-sky-300"
        />
        <Tarjeta
          titulo="Préstamos pendientes"
          valor={mostrar(pendientes.length)}
          detalle={cargando ? 'Cargando...' : `${estudiantes} estudiante(s) con deuda`}
          borde="border-l-amber-500"
          texto="text-amber-300"
        />
        <Tarjeta
          titulo="Equipos agotados"
          valor={mostrar(agotados)}
          detalle="Sin unidades disponibles"
          borde="border-l-red-500"
          texto="text-red-300"
        />
      </div>
    </section>
  )
}