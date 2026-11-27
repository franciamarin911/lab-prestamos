import { TriangleAlert } from 'lucide-react'

// Envoltorio de un campo de formulario: etiqueta, contador, ayuda y mensaje de error
export default function Campo({ id, etiqueta, error, ayuda, contador, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {etiqueta}
        </label>
        {contador && <span className="text-xs text-slate-500">{contador}</span>}
      </div>
      {children}
      {error ? (
        <p className="anim-fade-in mt-1.5 flex items-center gap-1 text-xs text-red-400">
          <TriangleAlert size={12} /> {error}
        </p>
      ) : (
        ayuda && <p className="mt-1.5 text-xs text-slate-500">{ayuda}</p>
      )}
    </div>
  )
}
