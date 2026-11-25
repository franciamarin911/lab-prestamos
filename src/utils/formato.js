// Quita tildes y pasa a minúsculas (para que "camara" encuentre "Cámara")
export function normalizar(texto) {
    return String(texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
}

// Fecha corta en formato boliviano
export function formatearFecha(fecha) {
    if (!fecha || typeof fecha.toDate !== 'function') return '...'
    return fecha.toDate().toLocaleString('es-BO', {
        dateStyle: 'short',
        timeStyle: 'short',
    })
}

// Días completos transcurridos desde una fecha de Firestore
export function diasDesde(fecha) {
    if (!fecha || typeof fecha.toDate !== 'function') return 0
    return Math.floor((Date.now() - fecha.toDate().getTime()) / 86400000)
}

// "hace 3 días", "hace 2 h", etc.
export function tiempoRelativo(fecha) {
    if (!fecha || typeof fecha.toDate !== 'function') return ''
    const minutos = Math.floor((Date.now() - fecha.toDate().getTime()) / 60000)
    if (minutos < 1) return 'hace un momento'
    if (minutos < 60) return `hace ${minutos} min`
    const horas = Math.floor(minutos / 60)
    if (horas < 24) return `hace ${horas} h`
    const dias = Math.floor(horas / 24)
    if (dias < 30) return dias === 1 ? 'hace 1 día' : `hace ${dias} días`
    const meses = Math.floor(dias / 30)
    return meses === 1 ? 'hace 1 mes' : `hace ${meses} meses`
}

// Iniciales para el avatar: "Juan Pérez" -> "JP"
export function iniciales(nombre) {
    const partes = String(nombre ?? '').trim().split(/\s+/)
    return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase()
}