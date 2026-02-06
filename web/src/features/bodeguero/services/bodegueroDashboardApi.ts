import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'

const CATALOG_URL = env.api.catalogo
const ORDERS_URL = env.api.orders
const LOGISTICS_URL = env.api.routes

export interface BodegueroDashboardStats {
    productosActivos: number
    pedidosPendientes: number
    pedidosValidacion: number
    rutasEnCurso: number
    alertas: {
        tipo: 'reporte' | 'alerta' | 'error'
        mensaje: string
    }[]
}

export async function getBodegueroDashboardStats(): Promise<BodegueroDashboardStats> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const headers = {
        Authorization: `Bearer ${token}`,
        'X-Authorization': `Bearer ${token}`
    }

    // Helper for robust fetching
    const robustFetch = async (url: string, defaultVal: any = []) => {
        try {
            const res = await fetch(url, { headers })
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) return { error: 'Unauthorized' }
                return defaultVal
            }
            const data = await res.json()
            return data.data || data || defaultVal
        } catch (e) {
            console.warn(`Fetch failed for ${url}:`, e)
            return defaultVal
        }
    }

    try {
        const [skusRes, ordersStatsRes, routesRes] = await Promise.all([
            robustFetch(`${CATALOG_URL}/api/v1/skus`),
            robustFetch(`${ORDERS_URL}/api/v1/orders/stats`),
            robustFetch(`${LOGISTICS_URL}/api/v1/routes?status=en_curso`)
        ])

        const skus = Array.isArray(skusRes) ? skusRes : []
        const ordersStats = Array.isArray(ordersStatsRes) ? ordersStatsRes : []
        const routes = Array.isArray(routesRes?.data) ? routesRes.data : (Array.isArray(routesRes) ? routesRes : [])

        // 1. SKUs Activos
        const activeSkus = skus.filter((s: any) => s.activo !== false).length

        // 2. Pedidos Pendientes de Validación
        const pendingValidation = ordersStats.find((s: any) => s.estado === 'pendiente_validacion')?.count || 0

        // 3. Pedidos ya validados pero por preparar (en ruta o asignados)
        const validado = ordersStats.find((s: any) => s.estado === 'validado')?.count || 0
        const asignado = ordersStats.find((s: any) => s.estado === 'asignado_ruta')?.count || 0
        const pendingPreparation = Number(validado) + Number(asignado)

        // 4. Rutas en ejecución
        const activeRoutes = routes.length

        // Generate smart alerts
        const alertas: BodegueroDashboardStats['alertas'] = []

        if (Number(pendingValidation) > 0) {
            alertas.push({ tipo: 'error', mensaje: `Hay ${pendingValidation} pedidos esperando validación de stock.` })
        }

        if (Number(pendingPreparation) > 0) {
            alertas.push({ tipo: 'alerta', mensaje: `Tienes ${pendingPreparation} pedidos validados pendientes de asignación o preparación.` })
        }

        if (activeRoutes > 0) {
            alertas.push({ tipo: 'reporte', mensaje: `Existen ${activeRoutes} rutas en curso descargando producto.` })
        }

        return {
            productosActivos: activeSkus || skus.length,
            pedidosPendientes: pendingPreparation,
            pedidosValidacion: Number(pendingValidation),
            rutasEnCurso: activeRoutes,
            alertas
        }
    } catch (error) {
        console.error('Error loading bodeguero dashboard stats:', error)
        return {
            productosActivos: 0,
            pedidosPendientes: 0,
            pedidosValidacion: 0,
            rutasEnCurso: 0,
            alertas: []
        }
    }
}
