import { useCallback, useRef, useState } from 'react'
import { Boxes, ClipboardList, FlaskConical, LogOut, Settings } from 'lucide-react'
import Ajustes from './components/Ajustes'
import Bienvenida from './components/Bienvenida'
import Dashboard from './components/Dashboard'
import Inventario from './components/Inventario'
import Prestamos from './components/Prestamos'
import FondoAurora from './components/ui/FondoAurora'
import Toasts from './components/ui/Toasts'

const PESTANAS = [
  { id: 'prestamos', etiqueta: 'Préstamos', Icono: ClipboardList },
  { id: 'inventario', etiqueta: 'Inventario', Icono: Boxes },
  { id: 'ajustes', etiqueta: 'Ajustes', Icono: Settings },
]

// Recuerda en esta pestaña del navegador que ya se ingresó (si se recarga, no vuelve a la bienvenida)
function leerIngreso() {
  try {
    return sessionStorage.getItem('lab-ingreso') === '1'
  } catch {
    return false
  }
}
function guardarIngreso(valor) {
  try {
    if (valor) sessionStorage.setItem('lab-ingreso', '1')
    else sessionStorage.removeItem('lab-ingreso')
  } catch {
    // si el navegador bloquea el almacenamiento, simplemente no se recuerda
  }
}

export default function App() {
  const [dentro, setDentro] = useState(leerIngreso)
  const [pestana, setPestana] = useState('prestamos')
  const [toasts, setToasts] = useState([])
  const contador = useRef(0)

  const cerrarToast = useCallback((id) => {
    setToasts((lista) => lista.filter((t) => t.id !== id))
  }, [])

  // Muestra un aviso apilado que desaparece solo a los 3,5 segundos
  const notificar = useCallback(
    (mensaje, tipo = 'exito') => {
      const id = ++contador.current
      setToasts((lista) => [...lista.slice(-3), { id, mensaje, tipo }])
      setTimeout(() => cerrarToast(id), 3500)
    },
    [cerrarToast],
  )

  function entrar() {
    guardarIngreso(true)
    setDentro(true)
    window.scrollTo({ top: 0 })
  }

  function salir() {
    guardarIngreso(false)
    setDentro(false)
    setPestana('prestamos')
    window.scrollTo({ top: 0 })
  }

  function cambiarPestana(id) {
    setPestana(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!dentro) return <Bienvenida onEntrar={entrar} />

  return (
    <div className="min-h-screen">
      <FondoAurora />

      {/* Barra superior de cristal */}
      <header className="sticky top-3 z-30 px-3 sm:px-6">
        <div className="vidrio-fuerte mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-2xl px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-900/40">
              <FlaskConical size={20} className="text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-bold text-white sm:text-base">Control de Préstamos</h1>
              <p className="hidden text-xs text-slate-400 sm:block">Laboratorio · Panel del Administrador</p>
            </div>
          </div>

          {/* Pestañas (pantallas medianas y grandes) */}
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Secciones">
            {PESTANAS.map(({ id, etiqueta, Icono }) => (
              <button
                key={id}
                type="button"
                onClick={() => cambiarPestana(id)}
                aria-current={pestana === id ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  pestana === id
                    ? 'bg-linear-to-r from-emerald-500/25 to-sky-500/20 text-emerald-200 ring-1 ring-emerald-400/30'
                    : 'text-slate-400 hover:bg-linear-to-r hover:from-emerald-500/10 hover:to-sky-500/10 hover:text-white'
                }`}
              >
                <Icono size={17} />
                {etiqueta}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={salir}
            className="hover-grad inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 sm:pb-12">
        <Dashboard />

        {/* "key" hace que la sección se anime cada vez que cambias de pestaña */}
        <div key={pestana} className="anim-slide-up">
          {pestana === 'prestamos' && <Prestamos notificar={notificar} />}
          {pestana === 'inventario' && <Inventario notificar={notificar} />}
          {pestana === 'ajustes' && <Ajustes notificar={notificar} />}
        </div>
      </main>

      <footer className="hidden border-t border-white/5 py-6 text-center text-xs text-slate-500 sm:block">
        UNIVALLE · Ingeniería de Sistemas Informáticos · Base de Datos III
      </footer>

      {/* Barra de navegación inferior (celular) */}
      <nav
        className="vidrio-fuerte fixed inset-x-3 bottom-3 z-30 grid grid-cols-3 gap-1 rounded-2xl p-1.5 sm:hidden"
        aria-label="Secciones"
      >
        {PESTANAS.map(({ id, etiqueta, Icono }) => (
          <button
            key={id}
            type="button"
            onClick={() => cambiarPestana(id)}
            aria-current={pestana === id ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition ${
              pestana === id
                ? 'bg-linear-to-br from-emerald-500/30 to-sky-500/25 text-emerald-200 ring-1 ring-emerald-400/30'
                : 'text-slate-400'
            }`}
          >
            <Icono size={20} />
            {etiqueta}
          </button>
        ))}
      </nav>

      <Toasts toasts={toasts} onCerrar={cerrarToast} />
    </div>
  )
}
