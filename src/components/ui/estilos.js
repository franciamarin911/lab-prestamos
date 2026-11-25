// Clases de Tailwind reutilizables para que todo el sistema se vea igual

// Campo de texto / lista. "ancho" y "relleno" se pueden cambiar sin chocar con otras clases.
export const entrada = (error, { ancho = 'w-full', relleno = 'px-3.5' } = {}) =>
  `${ancho} rounded-xl border bg-slate-800/60 ${relleno} py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
    error
      ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
      : 'border-slate-700 hover:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/20'
  }`

export const btnPrimario =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:-translate-y-0.5 hover:from-emerald-400 hover:to-teal-400 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'

export const btnSecundario =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50'

export const btnPeligro =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition hover:-translate-y-0.5 hover:bg-red-500 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0'

export const btnIcono =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white'

export const tarjeta =
  'rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur'