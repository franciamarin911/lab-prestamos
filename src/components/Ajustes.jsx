import { useState } from 'react'
import { Cloud, Database, FlaskConical, Image as ImageIcon, Trash2 } from 'lucide-react'
import { db } from '../firebase'
import { cloudinaryConfigurado, nombreNube } from '../services/imagenesService'
import {
    cargarDatosEjemplo,
    eliminarDatosEjemplo,
    resumenDatosEjemplo,
} from '../services/seedService'
import { mensajeError } from '../utils/validaciones'
import ConfirmDialog from './ui/ConfirmDialog'
import { btnPrimario, btnSecundario, tarjeta } from './ui/estilos'

function Estado({ activo, textoActivo, textoInactivo }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${activo
                    ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 ring-amber-500/30'
                }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${activo ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {activo ? textoActivo : textoInactivo}
        </span>
    )
}

export default function Ajustes({ notificar }) {
    const [accion, setAccion] = useState(null) // 'cargar' | 'borrar' | null
    const [trabajando, setTrabajando] = useState(false)
    const resumen = resumenDatosEjemplo()

    async function ejecutar() {
        setTrabajando(true)
        try {
            if (accion === 'cargar') {
                const r = await cargarDatosEjemplo()
                notificar(`Se cargaron ${r.equipos} equipos y ${r.prestamos} préstamos de ejemplo`)
            } else {
                const r = await eliminarDatosEjemplo()
                notificar(`Se eliminaron ${r.equipos} equipos y ${r.prestamos} préstamos de ejemplo`)
            }
        } catch (err) {
            console.error(err)
            notificar(mensajeError(err), 'error')
        }
        setTrabajando(false)
        setAccion(null)
    }

    return (
        <section className="grid gap-5 lg:grid-cols-2">
            {/* Datos de ejemplo */}
            <div className={`${tarjeta} p-6 lg:col-span-2`}>
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                        <FlaskConical size={22} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">Datos de ejemplo</h3>
                        <p className="mt-1 text-sm text-slate-400">
                            Carga un catálogo de <b className="text-slate-200">{resumen.equipos} equipos</b> con
                            códigos por categoría (MICRO-001, SEN-001, ACT-001, MOD-001, HERR-001, CAB-001) y un
                            historial de <b className="text-slate-200">{resumen.prestamos} préstamos</b>, con el stock
                            ya calculado. Sirve para probar paginación, filtros y el dashboard. Los datos propios
                            que hayas creado no se tocan.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button type="button" onClick={() => setAccion('cargar')} className={btnPrimario}>
                                <Database size={16} /> Cargar datos de ejemplo
                            </button>
                            <button type="button" onClick={() => setAccion('borrar')} className={btnSecundario}>
                                <Trash2 size={16} /> Eliminar datos de ejemplo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estado de conexiones */}
            <div className={`${tarjeta} p-6`}>
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
                        <Cloud size={22} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Base de datos (Firebase)</h3>
                        <p className="text-xs text-slate-500">Cloud Firestore</p>
                    </div>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                        <dt className="text-slate-400">Proyecto conectado</dt>
                        <dd className="font-mono text-slate-200">{db.app.options.projectId}</dd>
                    </div>
                </dl>
                <p className="mt-3 text-xs text-slate-500">
                    Verifica que este nombre coincida con el proyecto que abres en la consola de Firebase.
                </p>
            </div>

            <div className={`${tarjeta} p-6`}>
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                        <ImageIcon size={22} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Almacenamiento de fotos</h3>
                        <p className="text-xs text-slate-500">Cloudinary</p>
                    </div>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-400">Estado</dt>
                        <dd>
                            <Estado activo={cloudinaryConfigurado} textoActivo="Conectado" textoInactivo="No configurado" />
                        </dd>
                    </div>
                    {cloudinaryConfigurado && (
                        <div className="flex justify-between gap-4">
                            <dt className="text-slate-400">Nombre de la nube</dt>
                            <dd className="font-mono text-slate-200">{nombreNube}</dd>
                        </div>
                    )}
                </dl>
                {!cloudinaryConfigurado && (
                    <p className="mt-3 text-xs text-slate-500">
                        Agrega VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET a tu archivo .env y
                        reinicia el servidor.
                    </p>
                )}
            </div>

            {accion && (
                <ConfirmDialog
                    titulo={accion === 'cargar' ? '¿Cargar datos de ejemplo?' : '¿Eliminar datos de ejemplo?'}
                    peligro={accion === 'borrar'}
                    textoConfirmar={accion === 'cargar' ? 'Sí, cargar' : 'Sí, eliminar'}
                    cargando={trabajando}
                    onConfirmar={ejecutar}
                    onCancelar={() => setAccion(null)}
                >
                    {accion === 'cargar' ? (
                        <p>
                            Se crearán {resumen.equipos} equipos y {resumen.prestamos} préstamos de ejemplo en tu
                            base de datos de Firebase.
                        </p>
                    ) : (
                        <p>
                            Se eliminarán solo los equipos y préstamos marcados como ejemplo (y cualquier préstamo
                            que hayas hecho con esos equipos). Tus datos propios se conservan.
                        </p>
                    )}
                </ConfirmDialog>
            )}
        </section>
    )
}