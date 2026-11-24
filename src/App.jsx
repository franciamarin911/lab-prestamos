import { useRef, useState } from 'react'
import Dashboard from './components/Dashboard'
import Inventario from './components/Inventario'
import Prestamos from './components/Prestamos'

export default function App() {
  const [pestana, setPestana] = useState('prestamos')
  const [toast, setToast] = useState(null)
  const temporizador = useRef(null)

  // Muestra un aviso (toast) durante 3 segundos
  function notificar(mensaje, tipo = 'exito') {
    clearTimeout(temporizador.current)
    setToast({ mensaje, tipo })
    temporizador.current = setTimeout(() => setToast(null), 3000)
  }

  const botonPestana = (id) =>
    `rounded-lg px-4 py-2 font-semibold ${
      pestana === id
        ? 'bg-emerald-600 text-white'
        : 'text-slate-300 hover:bg-slate-800'
    }`

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Control de Préstamos de Laboratorio</h1>
        <p className="text-slate-400">Panel del Administrador</p>
      </header>

      <Dashboard />

      <nav className="mb-6 flex gap-2">
        <button
          className={botonPestana('prestamos')}
          onClick={() => setPestana('prestamos')}
        >
          Préstamos
        </button>
        <button
          className={botonPestana('inventario')}
          onClick={() => setPestana('inventario')}
        >
          Inventario
        </button>
      </nav>

      {pestana === 'prestamos' && <Prestamos notificar={notificar} />}
      {pestana === 'inventario' && <Inventario notificar={notificar} />}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 font-semibold text-white shadow-lg ${
            toast.tipo === 'error' ? 'bg-red-600' : 'bg-emerald-600'
          }`}
        >
          {toast.mensaje}
        </div>
      )}
    </div>
  )
}