import { useEffect, useState } from 'react'
import { Cable, Cog, Cpu, Package, Radar, Wifi, Wrench } from 'lucide-react'
import { optimizarUrl } from '../../services/imagenesService'

// Ícono y color de cada categoría (se usa cuando el equipo no tiene foto)
export const CATEGORIAS_UI = {
  Microcontroladores: { Icono: Cpu, color: 'text-emerald-300', fondo: 'from-emerald-500/25 to-emerald-950/40' },
  Sensores: { Icono: Radar, color: 'text-sky-300', fondo: 'from-sky-500/25 to-sky-950/40' },
  Actuadores: { Icono: Cog, color: 'text-amber-300', fondo: 'from-amber-500/25 to-amber-950/40' },
  Módulos: { Icono: Wifi, color: 'text-violet-300', fondo: 'from-violet-500/25 to-violet-950/40' },
  Herramientas: { Icono: Wrench, color: 'text-orange-300', fondo: 'from-orange-500/25 to-orange-950/40' },
  Cables: { Icono: Cable, color: 'text-pink-300', fondo: 'from-pink-500/25 to-pink-950/40' },
}
const POR_DEFECTO = { Icono: Package, color: 'text-slate-300', fondo: 'from-slate-500/25 to-slate-950/40' }

export function IconoCategoria({ categoria, size = 20 }) {
  const { Icono, color } = CATEGORIAS_UI[categoria] ?? POR_DEFECTO
  return <Icono size={size} className={color} />
}

// Muestra la foto del equipo; si no tiene (o falla al cargar) muestra el ícono de su categoría.
// ajuste="cubrir": rellena el recuadro (miniaturas). ajuste="contener": se ve el equipo completo
// sobre un fondo claro tipo estudio fotográfico (tarjetas y detalle).
export default function FotoEquipo({
  equipo,
  className = '',
  ancho = 400,
  iconSize = 36,
  ajuste = 'cubrir',
}) {
  const [falla, setFalla] = useState(false)
  const url = equipo?.fotoUrl

  useEffect(() => {
    setFalla(false)
  }, [url])

  if (!url || falla) {
    const { Icono, color, fondo } = CATEGORIAS_UI[equipo?.categoria] ?? POR_DEFECTO
    return (
      <div className={`flex items-center justify-center bg-linear-to-br ${fondo} ${className}`}>
        <Icono size={iconSize} className={color} />
      </div>
    )
  }

  if (ajuste === 'contener') {
    return (
      <div className={`relative overflow-hidden bg-linear-to-br from-slate-50 via-slate-100 to-slate-300 ${className}`}>
        <img
          src={optimizarUrl(url, ancho)}
          alt={equipo.nombre}
          loading="lazy"
          onError={() => setFalla(true)}
          className="h-full w-full object-contain p-4 mix-blend-multiply transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.7),transparent_60%)]" />
      </div>
    )
  }

  return (
    <img
      src={optimizarUrl(url, ancho)}
      alt={equipo.nombre}
      loading="lazy"
      onError={() => setFalla(true)}
      className={`object-cover ${className}`}
    />
  )
}
