// Clases de Tailwind reutilizables para que todo el sistema se vea igual

// Campo de texto de cristal. "ancho" y "relleno" se pueden cambiar sin chocar con otras clases.
export const entrada = (error, { ancho = 'w-full', relleno = 'px-3.5' } = {}) =>
  `${ancho} rounded-xl border bg-white/5 ${relleno} py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none backdrop-blur transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
    error
      ? 'border-red-500/60 focus:border-red-400 focus:ring-red-500/20'
      : 'border-white/10 hover:border-emerald-400/40 hover:bg-white/[0.07] focus:border-emerald-400 focus:ring-emerald-400/20'
  }`

export const btnPrimario =
  'brillo inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 via-teal-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 [background-size:200%_100%] transition-[background-position,transform,box-shadow] duration-500 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30 hover:[background-position:100%_0] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'

export const btnSecundario =
  'hover-grad inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 backdrop-blur transition hover:border-emerald-400/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'

export const btnPeligro =
  'brillo inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-red-600 via-rose-600 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/30 [background-size:200%_100%] transition-[background-position,transform,box-shadow] duration-500 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-500/30 hover:[background-position:100%_0] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'

export const btnIcono =
  'hover-grad inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:text-white'

export const tarjeta = 'vidrio rounded-2xl'
