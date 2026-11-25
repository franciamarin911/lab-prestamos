import { CATEGORIAS } from '../constants'

// Quita espacios repetidos y de los extremos, y unifica las tildes
export function limpiarEspacios(texto) {
  return String(texto ?? '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim()
}

// El código de equipo siempre se guarda en mayúsculas
export function normalizarCodigo(texto) {
  return limpiarEspacios(texto).toUpperCase()
}

// ---------- CI ----------
// Devuelve '' si es válido; si no, devuelve el mensaje de error.
export function validarCI(valor) {
  const ci = String(valor ?? '').trim()
  if (!ci) return 'El CI es obligatorio.'
  if (!/^\d+$/.test(ci)) {
    return 'El CI solo debe contener números (sin letras, espacios ni guiones).'
  }
  if (ci.length < 5 || ci.length > 10) {
    return 'El CI debe tener entre 5 y 10 dígitos.'
  }
  return ''
}

// ---------- Nombre de persona ----------
export function validarNombrePersona(valor) {
  const nombre = limpiarEspacios(valor)
  if (!nombre) return 'El nombre completo es obligatorio.'
  if (nombre.length < 3) return 'El nombre es demasiado corto.'
  if (nombre.length > 60) return 'El nombre no puede superar 60 caracteres.'
  if (!/^\p{L}+(?:[ '-]\p{L}+)*$/u.test(nombre)) {
    return 'El nombre solo puede contener letras y espacios (sin números ni símbolos).'
  }
  if (nombre.split(' ').length < 2) {
    return 'Escribe el nombre y el apellido del estudiante.'
  }
  return ''
}

// ---------- Datos del estudiante (préstamo) ----------
export function validarEstudiante(datos) {
  return (
    validarNombrePersona(datos.estudiante) ||
    validarCI(datos.codigoEstudiante) ||
    ''
  )
}

// ---------- Cantidad de un préstamo ----------
export function validarCantidad(valor, max = 9999) {
  const texto = String(valor ?? '').trim()
  if (texto === '') return 'La cantidad es obligatoria.'
  const n = Number(texto)
  if (!Number.isInteger(n)) return 'La cantidad debe ser un número entero.'
  if (n < 1) return 'La cantidad debe ser al menos 1.'
  if (n > max) {
    return max === 9999
      ? 'La cantidad no puede superar 9999.'
      : `Solo hay ${max} unidad(es) disponible(s).`
  }
  return ''
}

// ---------- Equipos ----------
export function validarNombreEquipo(valor) {
  const nombre = limpiarEspacios(valor)
  if (!nombre) return 'El nombre del equipo es obligatorio.'
  if (nombre.length < 3) return 'El nombre del equipo es demasiado corto.'
  if (nombre.length > 60) return 'El nombre del equipo no puede superar 60 caracteres.'
  if (!/^[\p{L}\p{N}][\p{L}\p{N} .,\-_/+()#"]*$/u.test(nombre)) {
    return 'El nombre del equipo contiene caracteres no permitidos.'
  }
  return ''
}

export function validarCodigoEquipo(valor) {
  const codigo = normalizarCodigo(valor)
  if (!codigo) return 'El código es obligatorio.'
  if (codigo.length < 3 || codigo.length > 20) {
    return 'El código debe tener entre 3 y 20 caracteres.'
  }
  if (!/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(codigo)) {
    return 'El código solo puede tener letras, números y guiones (ej. MICRO-001).'
  }
  return ''
}

export function validarStock(valor) {
  const texto = String(valor ?? '').trim()
  if (texto === '') return 'El stock total es obligatorio.'
  const n = Number(texto)
  if (!Number.isInteger(n)) return 'El stock total debe ser un número entero.'
  if (n < 0) return 'El stock total no puede ser negativo.'
  if (n > 9999) return 'El stock total no puede superar 9999.'
  return ''
}

export function validarCategoria(valor) {
  return CATEGORIAS.includes(valor) ? '' : 'Selecciona una categoría válida.'
}

export function validarEquipo(datos) {
  return (
    validarCategoria(datos.categoria) ||
    validarNombreEquipo(datos.nombre) ||
    validarCodigoEquipo(datos.codigo) ||
    validarStock(datos.stockTotal) ||
    ''
  )
}

// ---------- Foto del equipo (opcional) ----------
export function validarFoto(archivo) {
  if (!archivo) return 'Selecciona una imagen.'
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
    return 'Formato no permitido. Usa JPG, PNG o WEBP.'
  }
  if (archivo.size > 8 * 1024 * 1024) {
    return 'La imagen no puede superar 8 MB.'
  }
  return ''
}

// ---------- Mensajes de error de Firebase en lenguaje claro ----------
export function mensajeError(err) {
  const porCodigo = {
    'permission-denied':
      'Firebase rechazó la operación (reglas de seguridad). Revisa las reglas de Firestore.',
    unavailable: 'Sin conexión con Firebase. Revisa tu internet e inténtalo de nuevo.',
    'deadline-exceeded': 'Firebase tardó demasiado en responder. Inténtalo de nuevo.',
    aborted: 'Otro cambio simultáneo interrumpió la operación. Inténtalo de nuevo.',
    'resource-exhausted': 'Se alcanzó la cuota de uso de Firebase.',
  }
  if (err?.code && porCodigo[err.code]) return porCodigo[err.code]
  return err?.message || 'Ocurrió un error inesperado.'
}