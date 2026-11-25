import { useEffect, useState } from 'react'
import { Cable, Cog, Cpu, Package, Radar, Wifi, Wrench } from 'lucide-react'
import { optimizarUrl } from '../../services/imagenesService'

// Ícono y color de cada categoría (se usa cuando el equipo no tiene foto)
const CATEGORIAS_UI = {
    Microcontroladores: { Icono: Cpu, color: 'text-emerald-300', fondo: 'from-emerald-500/20 to-emerald-950/30' },
    Sensores: { Icono: Radar, color: 'text-sky-300', fondo: 'from-sky-500/20 to-sky-950/30' },
    Actuadores: { Icono: Cog, color: 'text-amber-300', fondo: 'from-amber-500/20 to-amber-950/30' },
    Módulos: { Icono: Wifi, color: 'text-violet-300', fondo: 'from-violet-500/20 to-violet-950/30' },
    Herramientas: { Icono: Wrench, color: 'text-orange-300', fondo: 'from-orange-500/20 to-orange-950/30' },
    Cables: { Icono: Cable, color: 'text-pink-300', fondo: 'from-pink-500/20 to-pink-950/30' },
}
const POR_DEFECTO = { Icono: Package, color: 'text-slate-300', fondo: 'from-slate-500/20 to-slate-950/30' }

export function IconoCategoria({ categoria, size = 20 }) {
    const { Icono, color } = CATEGORIAS_UI[categoria] ?? POR_DEFECTO
    return <Icono size={size} className={color} />
}

export function colorCategoria(categoria) {
    return (CATEGORIAS_UI[categoria] ?? POR_DEFECTO).color
}

// Muestra la foto del equipo; si no tiene (o falla al cargar) muestra el ícono de su categoría
export default function FotoEquipo({ equipo, className = '', ancho = 400, iconSize = 36 }) {
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