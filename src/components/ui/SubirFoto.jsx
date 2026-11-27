import { useRef, useState } from 'react'
import { ImagePlus, Info, LoaderCircle, RefreshCw, Trash2 } from 'lucide-react'
import {
  cloudinaryConfigurado,
  comprimirImagen,
  optimizarUrl,
  subirFoto,
} from '../../services/imagenesService'
import { validarFoto } from '../../utils/validaciones'

// Zona para elegir o arrastrar una foto. La foto se sube sola a la nube
// y el formulario recibe solo la URL (onCambio).
export default function SubirFoto({ url, onCambio, onOcupado }) {
  const entrada = useRef(null)
  const [subiendo, setSubiendo] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [error, setError] = useState('')
  const [arrastrando, setArrastrando] = useState(false)

  async function procesar(archivo) {
    setError('')
    const mensaje = validarFoto(archivo)
    if (mensaje) {
      setError(mensaje)
      return
    }
    if (!navigator.onLine) {
      setError('Sin conexión a internet: no se puede subir la foto.')
      return
    }
    setSubiendo(true)
    setProgreso(0)
    onOcupado?.(true)
    try {
      const liviana = await comprimirImagen(archivo)
      const urlNube = await subirFoto(liviana, setProgreso)
      onCambio(urlNube)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubiendo(false)
      onOcupado?.(false)
    }
  }

  function alElegir(e) {
    const archivo = e.target.files?.[0]
    e.target.value = '' // permite elegir la misma foto otra vez
    if (archivo) procesar(archivo)
  }

  function alSoltar(e) {
    e.preventDefault()
    setArrastrando(false)
    const archivo = e.dataTransfer.files?.[0]
    if (archivo) procesar(archivo)
  }

  if (!cloudinaryConfigurado) {
    return (
      <div className="flex gap-2 rounded-xl border border-slate-700 bg-slate-800/40 p-3 text-xs text-slate-400">
        <Info size={16} className="mt-0.5 shrink-0 text-sky-400" />
        <p>
          Las fotos no están configuradas (faltan las variables de Cloudinary en el
          archivo .env). Puedes guardar el equipo sin foto.
        </p>
      </div>
    )
  }

  return (
    <div>
      <input
        ref={entrada}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={alElegir}
      />

      {url ? (
        <div className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/40 p-3">
          <img
            src={optimizarUrl(url, 240)}
            alt="Foto del equipo"
            className="h-20 w-20 rounded-lg object-cover"
          />
          <div className="flex flex-1 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => entrada.current?.click()}
              disabled={subiendo}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
            >
              {subiendo ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {subiendo ? `Subiendo ${progreso}%` : 'Cambiar'}
            </button>
            <button
              type="button"
              onClick={() => onCambio('')}
              disabled={subiendo}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              <Trash2 size={14} /> Quitar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => entrada.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setArrastrando(true)
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={alSoltar}
          disabled={subiendo}
          className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
            arrastrando
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/40'
          }`}
        >
          {subiendo ? (
            <>
              <LoaderCircle size={26} className="animate-spin text-emerald-400" />
              <p className="text-sm text-slate-300">Subiendo foto… {progreso}%</p>
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <ImagePlus size={26} className="text-slate-400" />
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-emerald-300">Elige una foto</span> o arrástrala aquí
              </p>
              <p className="text-xs text-slate-500">JPG, PNG o WEBP · se reduce automáticamente</p>
            </>
          )}
        </button>
      )}

      {error && <p className="anim-fade-in mt-2 text-xs text-red-400">{error}</p>}
    </div>
  )
}
