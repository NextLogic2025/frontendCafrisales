import { useState, useEffect, useMemo } from 'react'
import { obtenerPedidos, type Pedido } from '../../../../supervisor/services/pedidosApi'

export type EstadoFiltro = 'TODOS' | 'PENDIENTE' | 'APROBADO' | 'ANULADO' | 'EN_PREPARACION' | 'FACTURADO' | 'EN_RUTA' | 'ENTREGADO'

export function useBodegueroPedidos() {
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('TODOS')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        cargarPedidos()
    }, [])

    useEffect(() => {
        setCurrentPage(1)
    }, [filtroEstado, searchTerm])

    const cargarPedidos = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await obtenerPedidos({ skipClients: true })

            // Hydrate missing clients for Bodeguero (if bulk fetch failed)
            const missingClients = data.filter(p => p.cliente?.razon_social === 'Cargando...' && p.cliente_id)
            if (missingClients.length > 0) {
                const uniqueIds = Array.from(new Set(missingClients.map(p => p.cliente_id!)))

                // Fetch individually
                const clientesData = await Promise.allSettled(
                    uniqueIds.map(id =>
                        // Import dynamically to avoid circle or use direct import at top
                        import('../../../../supervisor/services/clientesApi')
                            .then(mod => mod.obtenerClientePorId(id))
                    )
                )

                const clientesMap = new Map()
                clientesData.forEach((res, idx) => {
                    if (res.status === 'fulfilled' && res.value) {
                        clientesMap.set(uniqueIds[idx], res.value)
                    }
                })

                // Update data with found clients
                data.forEach(p => {
                    if (p.cliente_id && clientesMap.has(p.cliente_id)) {
                        const c = clientesMap.get(p.cliente_id)
                        p.cliente = {
                            razon_social: c.razon_social,
                            identificacion: c.identificacion
                        }
                    }
                })
            }

            // Sort by most recent
            const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            setPedidos(sorted)
        } catch (err: any) {
            console.error(err)
            setError(err?.message || 'Error al cargar los pedidos')
        } finally {
            setIsLoading(false)
        }
    }

    const pedidosFiltrados = useMemo(() => {
        return pedidos.filter(pedido => {
            // Filtro por estado
            const estadoNormalizado = pedido.estado_actual?.toLowerCase() || ''
            const filtroNormalizado = filtroEstado === 'TODOS' ? 'todos' : filtroEstado.toLowerCase()

            // Map filter keys to backend values if necessary
            const matchEstado = filtroEstado === 'TODOS' ||
                estadoNormalizado === filtroNormalizado ||
                (filtroNormalizado === 'pendiente' && estadoNormalizado === 'pendiente_validacion') ||
                (filtroNormalizado === 'anulado' && estadoNormalizado === 'cancelado')

            // Filtro por búsqueda
            const searchLower = searchTerm.toLowerCase()
            const matchSearch = !searchTerm ||
                pedido.id.toLowerCase().includes(searchLower) ||
                pedido.cliente?.razon_social?.toLowerCase().includes(searchLower) ||
                pedido.vendedor?.nombreCompleto?.toLowerCase().includes(searchLower)

            return matchEstado && matchSearch
        })
    }, [pedidos, filtroEstado, searchTerm])

    const totalPages = Math.ceil(pedidosFiltrados.length / itemsPerPage)
    const paginatedPedidos = pedidosFiltrados.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }

    return {
        pedidos,
        isLoading,
        error,
        filtroEstado,
        setFiltroEstado,
        searchTerm,
        setSearchTerm,
        pedidosFiltrados,
        paginatedPedidos,
        currentPage,
        totalPages,
        handlePageChange,
        cargarPedidos
    }
}
