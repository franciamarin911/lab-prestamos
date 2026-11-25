import { useCallback, useRef, useState } from 'react'
import { Boxes, ClipboardList, FlaskConical, LogOut, Settings } from 'lucide-react'
import Ajustes from './components/Ajustes'
import Bienvenida from './components/Bienvenida'
import Dashboard from './components/Dashboard'
import Inventario from './components/Inventario'
import Prestamos from './components/Prestamos'
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
  }

  function salir() {
    guardarIngreso(false)
    setDentro(false)
    setPestana('prestamos')
  }

  if (!dentro) return <Bienvenida onEntrar={entrar} />

  return (
    <div className="fondo-aurora min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-900/40">
              <FlaskConical size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-white">Control de Préstamos</h1>
              <p className="text-xs text-slate-400">Laboratorio · Panel del Administrador</p>
            </div>
          </div>

          <nav className="order-last flex w-full gap-1 sm:order-none sm:w-auto" aria-label="Secciones">
            {PESTANAS.map(({ id, etiqueta, Icono }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPestana(id)}
                aria-current={pestana === id ? 'page' : undefined}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                  pestana === id
                    ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
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
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-800/70 hover:text-white"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Dashboard />

        {/* "key" hace que la sección se anime cada vez que cambias de pestaña */}
        <div key={pestana} className="anim-slide-up">
          {pestana === 'prestamos' && <Prestamos notificar={notificar} />}
          {pestana === 'inventario' && <Inventario notificar={notificar} />}
          {pestana === 'ajustes' && <Ajustes notificar={notificar} />}
        </div>
      </main>

      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        UNIVALLE · Ingeniería de Sistemas Informáticos · Base de Datos III
      </footer>

      <Toasts toasts={toasts} onCerrar={cerrarToast} />
    </div>
  )
}