import { useRef } from 'react'

// Contenedor que se inclina en 3D y muestra un foco de luz siguiendo al mouse.
// (Los efectos solo se activan con mouse; en pantallas táctiles queda estático.)
export default function Inclinable({ children, className = '', max = 7, ...resto }) {
  const ref = useRef(null)

  function mover(e) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    el.style.setProperty('--rx', `${(0.5 - y) * max}deg`)
    el.style.setProperty('--ry', `${(x - 0.5) * max}deg`)
  }

  function salir() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div ref={ref} onMouseMove={mover} onMouseLeave={salir} className={`tilt ${className}`} {...resto}>
      {children}
    </div>
  )
}
