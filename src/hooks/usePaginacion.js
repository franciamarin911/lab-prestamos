import { useEffect, useState } from 'react'

// Divide una lista en páginas.
// "clave" es un texto que, al cambiar (por ejemplo al filtrar), vuelve a la página 1.
export default function usePaginacion(lista, tamanoInicial = 12, clave = '') {
    const [pagina, setPagina] = useState(1)
    const [tamano, setTamano] = useState(tamanoInicial)

    useEffect(() => {
        setPagina(1)
    }, [clave, tamano])

    const totalPaginas = Math.max(1, Math.ceil(lista.length / tamano))
    const actual = Math.min(pagina, totalPaginas)
    const inicio = (actual - 1) * tamano

    return {
        pagina: actual,
        setPagina,
        tamano,
        setTamano,
        totalPaginas,
        items: lista.slice(inicio, inicio + tamano),
        total: lista.length,
        desde: lista.length === 0 ? 0 : inicio + 1,
        hasta: Math.min(inicio + tamano, lista.length),
    }
}