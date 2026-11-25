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
        <Modal titulo={titulo} onCerrar={onCancelar} ancho="max-w-md" bloquear={cargando}>
            <div className="space-y-4 px-6 py-5">
                <div className="flex gap-3">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${peligro ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                            }`}
                    >
                        <TriangleAlert size={20} />
                    </div>
                    <div className="space-y-2 text-sm text-slate-300">{children}</div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
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
            </div>
        </Modal>
    )
}