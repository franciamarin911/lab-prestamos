// Categorías de materiales del laboratorio
export const CATEGORIAS = [
  'Microcontroladores',
  'Sensores',
  'Actuadores',
  'Módulos',
  'Herramientas',
  'Cables',
]

// Prefijo del código de inventario de cada categoría (MICRO-001, SEN-001, ...)
export const PREFIJOS = {
  Microcontroladores: 'MICRO',
  Sensores: 'SEN',
  Actuadores: 'ACT',
  Módulos: 'MOD',
  Herramientas: 'HERR',
  Cables: 'CAB',
}

// Estados posibles de un equipo
export const ESTADOS_EQUIPO = ['Disponible', 'Agotado', 'Mantenimiento']

// Estados posibles de un préstamo
export const ESTADOS_PRESTAMO = ['Pendiente', 'Devuelto']

// Cuántos registros por página puede elegir el administrador
export const TAMANOS_PAGINA = [8, 12, 24, 48]
