// Las fotos NO se guardan en el proyecto ni en Firestore: se suben a Cloudinary
// (nube) y en Firestore solo se guarda el enlace (URL) de la foto.

const NOMBRE_NUBE = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const cloudinaryConfigurado = Boolean(NOMBRE_NUBE && PRESET)
export const nombreNube = NOMBRE_NUBE || ''

// Pide a Cloudinary una versión liviana de la foto (ancho máximo, formato y calidad automáticos)
export function optimizarUrl(url, ancho = 400) {
  if (!url || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/w_${ancho},c_limit,f_auto,q_auto/`)
}

// Reduce la foto en el navegador ANTES de subirla (máx. 900 px, JPG de buena calidad)
export async function comprimirImagen(archivo, maxLado = 900, calidad = 0.82) {
  const urlTemporal = URL.createObjectURL(archivo)
  try {
    const img = await new Promise((resolver, rechazar) => {
      const i = new Image()
      i.onload = () => resolver(i)
      i.onerror = () => rechazar(new Error('No se pudo leer la imagen. Prueba con otra.'))
      i.src = urlTemporal
    })
    const escala = Math.min(1, maxLado / Math.max(img.width, img.height))
    const ancho = Math.max(1, Math.round(img.width * escala))
    const alto = Math.max(1, Math.round(img.height * escala))

    const lienzo = document.createElement('canvas')
    lienzo.width = ancho
    lienzo.height = alto
    const ctx = lienzo.getContext('2d')
    ctx.fillStyle = '#ffffff' // fondo blanco para PNG con transparencia
    ctx.fillRect(0, 0, ancho, alto)
    ctx.drawImage(img, 0, 0, ancho, alto)

    const blob = await new Promise((resolver) =>
      lienzo.toBlob(resolver, 'image/jpeg', calidad),
    )
    if (!blob) throw new Error('No se pudo procesar la imagen.')
    return blob
  } finally {
    URL.revokeObjectURL(urlTemporal)
  }
}

// Sube la foto a Cloudinary y devuelve su URL. "onProgreso" recibe 0-100.
export function subirFoto(archivo, onProgreso) {
  return new Promise((resolver, rechazar) => {
    if (!cloudinaryConfigurado) {
      rechazar(new Error('El almacenamiento de fotos no está configurado (revisa tu .env).'))
      return
    }
    const datos = new FormData()
    datos.append('file', archivo, 'foto.jpg')
    datos.append('upload_preset', PRESET)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${NOMBRE_NUBE}/image/upload`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgreso) {
        onProgreso(Math.round((e.loaded / e.total) * 100))
      }
    }
    xhr.onload = () => {
      try {
        const respuesta = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300 && respuesta.secure_url) {
          resolver(respuesta.secure_url)
        } else {
          const motivo = respuesta?.error?.message
          rechazar(new Error(motivo ? `No se pudo subir la foto: ${motivo}` : 'No se pudo subir la foto.'))
        }
      } catch {
        rechazar(new Error('Respuesta inválida del servidor de fotos.'))
      }
    }
    xhr.onerror = () => rechazar(new Error('Sin conexión: no se pudo subir la foto.'))
    xhr.send(datos)
  })
}
