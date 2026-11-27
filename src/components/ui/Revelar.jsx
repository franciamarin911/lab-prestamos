import { useEffect, useRef, useState } from 'react'

// Hace aparecer su contenido (subiendo y desenfocándose) cuando entra en pantalla al hacer scroll
export default function Revelar({ children, retraso = 0, className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-8 opacity-0 blur-sm'
      } ${className}`}
      style={{ transitionDelay: `${retraso}ms` }}
    >
      {children}
    </div>
  )
}
