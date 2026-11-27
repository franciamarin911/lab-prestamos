import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Boxes,
  ChevronDown,
  CircleCheck,
  ClipboardCheck,
  Cloud,
  Cpu,
  FlaskConical,
  Image as ImageIcon,
  PackagePlus,
  Undo2,
  Zap,
} from 'lucide-react'
import FondoAurora from './ui/FondoAurora'
import Inclinable from './ui/Inclinable'
import Revelar from './ui/Revelar'
import { btnPrimario, btnSecundario } from './ui/estilos'

const funciones = [
  { Icono: Boxes, titulo: 'Inventario inteligente', texto: 'Equipos con código automático por categoría, foto y stock siempre al día.', grad: 'from-emerald-400 to-teal-600' },
  { Icono: Zap, titulo: 'Stock automático', texto: 'Cada préstamo descuenta unidades y cada devolución las repone, sin errores.', grad: 'from-amber-400 to-orange-600' },
  { Icono: Cloud, titulo: 'Tiempo real', texto: 'Todo se sincroniza al instante con Cloud Firestore desde cualquier dispositivo.', grad: 'from-sky-400 to-blue-600' },
  { Icono: ImageIcon, titulo: 'Fotos en la nube', texto: 'Las imágenes viven en la nube: tu proyecto se mantiene liviano y rápido.', grad: 'from-violet-400 to-fuchsia-600' },
]

const pasos = [
  { Icono: PackagePlus, titulo: 'Registra el equipo', texto: 'Agrega nombre, categoría, stock y una foto opcional. El código MICRO-001, SEN-001… se asigna solo.', chips: ['Código automático', 'Foto opcional'] },
  { Icono: ClipboardCheck, titulo: 'Presta con un clic', texto: 'Elige al estudiante y el equipo. El stock se descuenta de forma segura mediante transacciones.', chips: ['CI validado', 'Stock protegido'] },
  { Icono: Undo2, titulo: 'Recibe la devolución', texto: 'Marca "Devolver" y las unidades vuelven al inventario. El dashboard se actualiza al instante.', chips: ['Tiempo real', 'Historial completo'] },
]

export default function Bienvenida({ onEntrar }) {
  const raiz = useRef(null)
  const barra = useRef(null)
  const linea = useRef(null)
  const [paso, setPaso] = useState(0)

  // Con la tecla Enter también se puede ingresar
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === 'Enter') onEntrar()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [onEntrar])

  // Scrollytelling: la barra superior, el paralaje y la línea de tiempo siguen al scroll
  useEffect(() => {
    let cuadro = 0
    const actualizar = () => {
      cuadro = 0
      const y = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      raiz.current?.style.setProperty('--sy', String(y))
      if (barra.current) barra.current.style.transform = `scaleX(${total > 0 ? y / total : 0})`
      const l = linea.current
      if (l) {
        const r = l.getBoundingClientRect()
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.65 - r.top) / r.height))
        l.style.setProperty('--p', String(p))
        const activos = p > 0.8 ? 3 : p > 0.45 ? 2 : p > 0.1 ? 1 : 0
        setPaso((anterior) => (anterior === activos ? anterior : activos))
      }
    }
    const alScroll = () => {
      if (!cuadro) cuadro = requestAnimationFrame(actualizar)
    }
    actualizar()
    window.addEventListener('scroll', alScroll, { passive: true })
    window.addEventListener('resize', alScroll)
    return () => {
      window.removeEventListener('scroll', alScroll)
      window.removeEventListener('resize', alScroll)
      if (cuadro) cancelAnimationFrame(cuadro)
    }
  }, [])

  // La escena 3D gira suavemente según la posición del mouse
  function moverEscena(e) {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    e.currentTarget.style.setProperty('--ry', `${x * 16}deg`)
    e.currentTarget.style.setProperty('--rx', `${-y * 14}deg`)
  }
  function soltarEscena(e) {
    e.currentTarget.style.removeProperty('--ry')
    e.currentTarget.style.removeProperty('--rx')
  }

  function irA(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={raiz} className="relative text-slate-100">
      <FondoAurora />

      {/* Barra de progreso de lectura */}
      <div
        ref={barra}
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-linear-to-r from-emerald-400 via-sky-400 to-violet-400"
        style={{ transform: 'scaleX(0)' }}
      />

      {/* Barra superior flotante */}
      <header className="fixed inset-x-0 top-3 z-40 px-3 sm:px-6">
        <div className="vidrio-fuerte mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-900/40">
              <FlaskConical size={18} className="text-white" />
            </div>
            <span className="text-sm font-bold">Control de Préstamos</span>
          </div>
          <button type="button" onClick={onEntrar} className={`${btnPrimario} !px-4 !py-2`}>
            Ingresar <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* ---------- HERO ---------- */}
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 pb-16 pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="anim-slide-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Panel del Administrador
            </p>
            <h1
              className="anim-slide-up mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
              style={{ animationDelay: '100ms' }}
            >
              Control de préstamos
              <span className="texto-aurora block">de laboratorio</span>
            </h1>
            <p
              className="anim-slide-up mt-6 max-w-xl text-base text-slate-400 sm:text-lg"
              style={{ animationDelay: '200ms' }}
            >
              Gestiona el inventario de componentes y registra entregas y devoluciones desde un solo
              lugar, en tiempo real y desde cualquier dispositivo.
            </p>
            <div
              className="anim-slide-up mt-9 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: '300ms' }}
            >
              <button type="button" onClick={onEntrar} autoFocus className={`${btnPrimario} !px-8 !py-4 !text-base`}>
                Ingresar al sistema <ArrowRight size={20} />
              </button>
              <button type="button" onClick={() => irA('como')} className={`${btnSecundario} !px-6 !py-4 !text-base`}>
                Ver cómo funciona
              </button>
            </div>
            <p className="anim-slide-up mt-4 text-xs text-slate-500" style={{ animationDelay: '380ms' }}>
              También puedes presionar Enter
            </p>
          </div>

          {/* Escena 3D interactiva */}
          <div
            className="anim-slide-up relative mx-auto h-[24rem] w-full max-w-md [perspective:1200px] sm:h-[28rem] lg:max-w-none"
            style={{ animationDelay: '250ms' }}
            onMouseMove={moverEscena}
            onMouseLeave={soltarEscena}
          >
            <div className="escena-3d absolute inset-0">
              {/* Tarjeta principal */}
              <div className="absolute left-1/2 top-1/2 w-[17rem] sm:w-[19rem]" style={{ transform: 'translate(-50%, -50%) translateZ(20px)' }}>
                <div className="vidrio-fuerte rounded-3xl p-4">
                  <div className="flex h-36 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500/30 to-emerald-950/60">
                    <Cpu size={56} className="text-emerald-300" />
                  </div>
                  <div className="mt-4 flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-white">Arduino Uno R3</p>
                      <p className="font-mono text-xs text-slate-500">MICRO-001</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
                      Disponible
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-slate-400">Disponibles</span>
                      <span className="font-semibold text-slate-200">8 / 12</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="anim-grow-bar h-full w-2/3 rounded-full bg-linear-to-r from-emerald-400 to-sky-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Métrica flotante */}
              <div className="absolute -right-2 top-4 sm:right-0" style={{ transform: 'translateZ(110px)' }}>
                <div className="anim-float vidrio-fuerte rounded-2xl px-4 py-3" style={{ animationDelay: '-2s' }}>
                  <p className="text-xs text-slate-400">Préstamos pendientes</p>
                  <p className="text-3xl font-extrabold text-amber-300">16</p>
                </div>
              </div>

              {/* Aviso flotante */}
              <div className="absolute -left-2 bottom-6 sm:left-0" style={{ transform: 'translateZ(150px)' }}>
                <div className="anim-float vidrio-fuerte flex items-center gap-3 rounded-2xl px-4 py-3" style={{ animationDelay: '-4s' }}>
                  <CircleCheck size={22} className="text-emerald-300" />
                  <div>
                    <p className="text-sm font-semibold text-white">Devolución registrada</p>
                    <p className="text-xs text-slate-400">Stock repuesto</p>
                  </div>
                </div>
              </div>

              {/* Chip flotante */}
              <div className="absolute right-6 bottom-2 sm:right-10" style={{ transform: 'translateZ(70px)' }}>
                <div className="anim-float rounded-full bg-linear-to-r from-violet-500 to-sky-500 px-4 py-1.5 text-xs font-bold shadow-lg shadow-violet-900/50" style={{ animationDelay: '-1s' }}>
                  En la nube ☁
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => irA('funciones')}
          aria-label="Bajar para ver más"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs text-slate-500 transition hover:text-emerald-300 sm:flex"
        >
          Desliza
          <ChevronDown size={20} className="animate-bounce" />
        </button>
      </section>

      {/* ---------- FUNCIONES ---------- */}
      <section id="funciones" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <Revelar className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Todo en uno</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Pensado para el <span className="texto-aurora">laboratorio</span>
          </h2>
          <p className="mt-4 text-slate-400">Menos cuadernos, más control. Estas son las piezas que hacen que funcione.</p>
        </Revelar>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {funciones.map(({ Icono, titulo, texto, grad }, i) => (
            <Revelar key={titulo} retraso={i * 110}>
              <Inclinable className="vidrio h-full rounded-3xl p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br ${grad} shadow-lg`}>
                  <Icono size={24} className="text-white" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{texto}</p>
              </Inclinable>
            </Revelar>
          ))}
        </div>
      </section>

      {/* ---------- CÓMO FUNCIONA (línea de tiempo con scroll) ---------- */}
      <section id="como" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <Revelar className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Cómo funciona</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Tres pasos, <span className="texto-aurora">cero papeles</span>
          </h2>
        </Revelar>

        <div ref={linea} className="relative mx-auto mt-16 max-w-4xl" style={{ '--p': 0 }}>
          <div className="absolute bottom-2 left-5 top-2 w-px bg-white/10 sm:left-1/2" />
          <div
            className="absolute left-5 top-2 w-px bg-linear-to-b from-emerald-400 via-sky-400 to-violet-400 sm:left-1/2"
            style={{ height: 'calc((100% - 1rem) * var(--p))' }}
          />

          {pasos.map(({ Icono, titulo, texto, chips }, i) => {
            const izquierda = i % 2 === 0
            const activo = paso > i
            return (
              <div
                key={titulo}
                className={`relative pb-14 pl-14 last:pb-0 sm:w-1/2 sm:pl-0 ${
                  izquierda ? 'sm:pr-14' : 'sm:ml-auto sm:pl-14'
                }`}
              >
                <span
                  className={`absolute top-6 left-5 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    izquierda ? 'sm:left-auto sm:right-0 sm:translate-x-1/2' : 'sm:left-0'
                  } ${
                    activo
                      ? 'border-emerald-300 bg-emerald-400 shadow-[0_0_24px_6px_rgba(52,211,153,0.55)]'
                      : 'border-white/20 bg-slate-900'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-950">{activo ? i + 1 : ''}</span>
                </span>

                <Revelar>
                  <Inclinable className="vidrio rounded-3xl p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-emerald-300">
                        <Icono size={22} />
                      </div>
                      <h3 className="text-xl font-bold text-white">{titulo}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">{texto}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {chips.map((c) => (
                        <span key={c} className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-white/10">
                          {c}
                        </span>
                      ))}
                    </div>
                  </Inclinable>
                </Revelar>
              </div>
            )
          })}
        </div>
      </section>

      {/* ---------- LLAMADA FINAL ---------- */}
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-10">
        <Revelar>
          <Inclinable className="vidrio-fuerte relative overflow-hidden rounded-[2rem] px-6 py-14 text-center sm:px-12" max={3}>
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-sky-500/25 blur-3xl" />
            <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-5xl">
              Todo listo para <span className="texto-aurora">empezar</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-slate-400">
              Entra al panel y administra tu laboratorio en segundos.
            </p>
            <button type="button" onClick={onEntrar} className={`${btnPrimario} relative mt-8 !px-10 !py-4 !text-base`}>
              Ingresar al sistema <ArrowRight size={20} />
            </button>
          </Inclinable>
        </Revelar>
      </section>

      <footer className="pb-10 text-center text-xs text-slate-500">
        Universidad Privada del Valle · Ingeniería de Sistemas Informáticos · Base de Datos III
      </footer>
    </div>
  )
}
