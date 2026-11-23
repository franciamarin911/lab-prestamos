import { db } from './firebase'

export default function App() {
  console.log('Firestore conectado:', db.type)
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-emerald-400">
        Tailwind funciona ✔
      </h1>
      <p className="mt-2 text-slate-300">Revisa la consola del navegador (F12).</p>
    </div>
  )
}