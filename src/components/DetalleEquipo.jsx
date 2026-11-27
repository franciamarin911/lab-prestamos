import { useEffect, useState } from 'react'
import { Check, Copy, Pencil, Trash2 } from 'lucide-react'
import { suscribirPrestamosDeEquipo } from '../services/prestamosEquipoService'
import { iniciales, tiempoRelativo } from '../utils/formato'
import Modal from './ui/Modal'
import EstadoBadge from './ui/EstadoBadge'
import FotoEquipo, { IconoCategoria } from './ui/FotoEquipo'
import { btnPrimario, btnSecundario } from './ui/estilos'

const colorBarra = {
  Disponible: 'from-emerald-400 to-teal-400',
  Agotado: 'from-red-400 to-rose-400',
  Mantenimiento: 'from-slate-400 to-slate-500',
}

function Dato({ etiqueta, valor, color }) {
  return (
    <div className="vidrio rounded-2xl px-4 py-3 text-center">
      <p className={`text-2xl font-extrabold tabular-nums ${color}`}>{valor}</p>
      <p className="text-xs text-slate-400">{etiqueta}</p>
    </div>
  )
}

// Vista detallada de un equipo: foto grande, stock y préstamos de ese equipo (en tiempo real)
export default function DetalleEquipo({ equipo, onCerrar, onEditar, onEliminar }) {
  const [prestamos, setPrestamos] = useState(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    return suscribirPrestamosDeEquipo(equipo.id, setPrestamos, (err) => {
      console.error(err)
      setPrestamos([])
    })
  }, [equipo.id])

  const total = Number(equipo.stockTotal) || 0
  const disponible = Number(equipo.stockDisponible) || 0
  const prestadas = Math.max(0, total - disponible)
  const porcentaje = total > 0 ? Math.round((disponible / total) * 100) : 0

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(equipo.codigo)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1800)
    } catch {
      // si el navegador no permite copiar, no pasa nada
    }
  }

  return (
    <Modal titulo="Detalle del equipo" subtitulo={equipo.codigo} onCerrar={onCerrar} ancho="max-w-4xl">
      <div className="grid gap-6 p-6 md:grid-cols-5">
        {/* Foto */}
        <div className="group md:col-span-2">
          <FotoEquipo
            equipo={equipo}
            ajuste="contener"
            ancho={900}
            iconSize={80}
            className="aspect-square w-full rounded-3xl ring-1 ring-white/10"
          />
        </div>

        {/* Información */}
        <div className="flex flex-col gap-5 md:col-span-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-inset ring-white/10">
                <IconoCategoria categoria={equipo.categoria} size={14} />
                {equipo.categoria}
              </span>
              <EstadoBadge estado={equipo.estado} />
            </div>
            <h3 className="mt-3 text-2xl font-extrabold leading-tight text-white sm:text-3xl">{equipo.nombre}</h3>
            <button
              type="button"
              onClick={copiarCodigo}
              className="hover-grad mt-2 inline-flex items-center gap-2 rounded-lg px-2 py-1 font-mono text-sm text-slate-400 transition hover:text-white"
              title="Copiar código"
            >
              {equipo.codigo}
              {copiado ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Dato etiqueta="Total" valor={total} color="text-slate-100" />
            <Dato etiqueta="Disponibles" valor={disponible} color="text-emerald-300" />
            <Dato etiqueta="Prestadas" valor={prestadas} color="text-amber-300" />
          </div>

          <div>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-slate-400">Disponibilidad</span>
              <span className="font-semibold text-slate-200">{porcentaje}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`anim-grow-bar h-full rounded-full bg-linear-to-r ${colorBarra[equipo.estado] ?? 'from-slate-400 to-slate-500'}`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>

          {/* Préstamos de este equipo */}
          <div className="min-h-0">
            <h4 className="mb-2 text-sm font-semibold text-slate-200">Préstamos de este equipo</h4>
            {prestamos === null ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton h-12 rounded-xl" />
                ))}
              </div>
            ) : prestamos.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-sm text-slate-500">
                Este equipo aún no tiene préstamos.
              </p>
            ) : (
              <ul className="max-h-52 space-y-2 overflow-y-auto pr-1">
                {prestamos.slice(0, 12).map((p) => (
                  <li
                    key={p.id}
                    className="hover-grad flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-slate-600 to-slate-800 text-xs font-bold text-slate-100">
                      {iniciales(p.estudiante)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{p.estudiante}</p>
                      <p className="text-xs text-slate-500">
                        {p.cantidad} unidad(es) · {tiempoRelativo(p.fechaPrestamo)}
                      </p>
                    </div>
                    <EstadoBadge estado={p.estado} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-white/10 bg-slate-900/90 px-6 py-4 backdrop-blur">
        <button type="button" onClick={() => onEliminar(equipo)} className={`${btnSecundario} !text-red-300 hover:!border-red-400/40`}>
          <Trash2 size={16} /> Eliminar
        </button>
        <button type="button" onClick={() => onEditar(equipo)} className={btnPrimario}>
          <Pencil size={16} /> Editar equipo
        </button>
      </div>
    </Modal>
  )
}
