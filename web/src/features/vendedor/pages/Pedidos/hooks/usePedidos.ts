import { useState, useEffect, useMemo } from 'react'
import { obtenerMisClientes } from '../../../../supervisor/services/clientesApi'
import { getOrders } from '../../../services/pedidosApi'
import { Pedido, EstadoPedido } from '../../../../cliente/types'
import { getValidToken } from '../../../../../services/auth/authClient'
import { jwtDecode } from 'jwt-decode'

export type FilterOrigin = 'all' | 'me' | 'client'

export const usePedidos = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterOrigin, setFilterOrigin] = useState<FilterOrigin>('all')
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    useEffect(() => {
        const loadId = async () => {
            const token = await getValidToken()
            if (token) {
                try {
                    const decoded: any = jwtDecode(token)
                    setCurrentUserId(decoded.sub || decoded.userId || decoded.id)
                } catch (e) {
                    console.error("Error decoding token", e)
                }
            }
        }
        loadId()
    }, [])

    const fetchPedidos = async () => {
        try {
            setIsLoading(true)

            // 1. Obtener todos los pedidos directamente
            // La API ya debería filtrar por permisos del vendedor/supervisor
            const allOrders = await getOrders()

            // 2. Mapear
            const mappedOrders: Pedido[] = allOrders.map(order => ({
                id: String(order.id),
                orderNumber: order.numero_pedido || order.id.slice(0, 8),
                createdAt: order.creado_en || order.created_at || new Date().toISOString(),
                totalAmount: Number(order.total || 0),
                status: (order.estado as EstadoPedido) || EstadoPedido.PENDING,
                // Almacenar metadatos de origen en el objeto si es posible, o inferirlo
                // La API devuelve 'creado_por' o 'origen'?
                // Vamos a asumir que 'origen' puede venir, o comparamos ids
                items: (order.items || []).map((item: any) => ({
                    id: String(item.id || Math.random()),
                    productName: item.sku_nombre_snapshot || item.product_name || 'Producto',
                    quantity: Number(item.cantidad || 0),
                    unit: item.sku_tipo_empaque_snapshot || 'ud',
                    unitPrice: Number(item.precio_unitario_final || item.precio_unitario_base || 0),
                    subtotal: Number(item.subtotal || 0),
                    cantidad_solicitada: item.cantidad_solicitada,
                    motivo_ajuste: item.motivo_ajuste
                })),
                // @ts-ignore - Extension temporal para filtro
                creado_por_id: (order as any).creado_por_id || (order as any).created_by_id, // Necesitamos esto del backend
                origen: (order as any).origen // 'app_cliente' | 'web_vendedor' etc
            }))

            setPedidos(mappedOrders)
        } catch (error) {
            console.error('Error fetching pedidos:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPedidos()
    }, [])

    const filteredPedidos = useMemo(() => {
        return pedidos.filter(p => {
            // Filtro por texto
            const matchesSearch = p.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.id.toLowerCase().includes(searchTerm.toLowerCase())

            // Filtro por origen
            // Filtro por origen
            let matchesOrigin = true

            // NOTE: This assumes 'currentUserId' is correctly populated from the token
            // and 'creado_por_id' is returned by the backend.

            if (filterOrigin === 'me') {
                const pMod = p as any
                // Strict check: Must match ID explicitly
                if (currentUserId && pMod.creado_por_id) {
                    matchesOrigin = String(pMod.creado_por_id) === String(currentUserId)
                }
                // Fallback to 'origen' string if ID is missing but origin text is clear
                else if (pMod.origen === 'web_vendedor' || pMod.origen === 'movil_vendedor') {
                    matchesOrigin = true
                }
                // If neither ID match nor explicit origin text, assume NOT me (safe default to avoid showing client orders)
                else {
                    matchesOrigin = false
                }
            } else if (filterOrigin === 'client') {
                const pMod = p as any
                // Strict check: Must NOT match ID (assuming keys exist)
                if (currentUserId && pMod.creado_por_id) {
                    matchesOrigin = String(pMod.creado_por_id) !== String(currentUserId)
                }
                // Fallback
                else if (pMod.origen === 'app_cliente' || pMod.origen === 'web_cliente') {
                    matchesOrigin = true
                }
                // If no info, assume it IS client (opposite of 'me' safe default? Or safer to hide?)
                // Let's go with: if we can't prove it's me, and it's not explicitly client... 
                // Actually, for 'client' filter, we probably want to see everything that is NOT me.
                else {
                    matchesOrigin = true
                }
            }

            return matchesSearch && matchesOrigin
        })
    }, [pedidos, searchTerm, filterOrigin, currentUserId])

    // Pagination
    const [page, setPage] = useState(1)
    const itemsPerPage = 10

    const paginatedPedidos = useMemo(() => {
        const startIndex = (page - 1) * itemsPerPage
        return filteredPedidos.slice(startIndex, startIndex + itemsPerPage)
    }, [filteredPedidos, page])

    const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage)

    // Reset page when filters change
    useEffect(() => {
        setPage(1)
    }, [searchTerm, filterOrigin])

    return {
        pedidos: paginatedPedidos, // Return paginated data
        totalPedidos: filteredPedidos.length,
        page,
        setPage,
        totalPages,
        itemsPerPage,
        isLoading,
        searchTerm,
        setSearchTerm,
        fetchPedidos,
        filterOrigin,
        setFilterOrigin
    }
}
