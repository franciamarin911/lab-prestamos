const estilos = {
  Disponible: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  Devuelto: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  Pendiente: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  Agotado: 'bg-red-500/15 text-red-300 ring-red-500/30',
  Mantenimiento: 'bg-slate-500/20 text-slate-300 ring-slate-500/30',
}

const puntos = {
  Disponible: 'bg-emerald-400',
  Devuelto: 'bg-emerald-400',
  Pendiente: 'bg-amber-400',
  Agotado: 'bg-red-400',
  Mantenimiento: 'bg-slate-400',
}

// Etiqueta de color para los estados
export default function EstadoBadge({ estado }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        estilos[estado] ?? 'bg-slate-500/20 text-slate-300 ring-slate-500/30'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${puntos[estado] ?? 'bg-slate-400'}`} />
      {estado}
    </span>
  )
}
