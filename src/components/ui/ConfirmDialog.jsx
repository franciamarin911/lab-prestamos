import { LoaderCircle, TriangleAlert } from 'lucide-react'
import Modal from './Modal'
import { btnPeligro, btnPrimario, btnSecundario } from './estilos'

// Ventana de confirmación ("¿Seguro que quieres eliminar?")
export default function ConfirmDialog({
  titulo,
  children,
  textoConfirmar = 'Confirmar',
  peligro = false,
  cargando = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal
      titulo={titulo}
      onCerrar={onCancelar}
      ancho="sm"
      bloquear={cargando}
      pie={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancelar} disabled={cargando} className={btnSecundario}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={cargando}
            className={peligro ? btnPeligro : btnPrimario}
          >
            {cargando && <LoaderCircle size={16} className="animate-spin" />}
            {textoConfirmar}
          </button>
        </div>
      }
    >
      <div className="flex gap-4 px-6 py-6">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            peligro
              ? 'bg-linear-to-br from-red-500/25 to-orange-500/15 text-red-300'
              : 'bg-linear-to-br from-amber-500/25 to-yellow-500/15 text-amber-300'
          }`}
        >
          <TriangleAlert size={22} />
        </div>
        <div className="min-w-0 space-y-2 text-sm leading-relaxed text-slate-300">{children}</div>
      </div>
    </Modal>
  )
}
