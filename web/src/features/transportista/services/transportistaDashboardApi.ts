// web/src/features/transportista/services/transportistaDashboardApi.ts
import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'

const ROUTES_URL = env.api.routes
const DELIVERY_URL = env.api.delivery

export interface TransportistaDashboardStats {
    pedidosHoy: number
    entregasPendientes: number
    entregasCompletadas: number
    devolucionesAsignadas: number
    rutasEnCurso: number
    alertas: number
}

export async function getTransportistaDashboardStats(): Promise<TransportistaDashboardStats> {
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
            if (!res.ok) return defaultVal
            const data = await res.json()
            return data.data || data || defaultVal
        } catch (e) {
            console.warn(`Fetch failed for ${url}:`, e)
            return defaultVal
        }
    }

    try {
        const today = new Date().toISOString().split('T')[0]

        const [routeStatsRes, routesTodayRes, deliveriesRes] = await Promise.all([
            robustFetch(`${ROUTES_URL}/api/v1/routes/stats`),
            robustFetch(`${ROUTES_URL}/api/v1/routes?date=${today}`),
            robustFetch(`${DELIVERY_URL}/api/v1/deliveries?date=${today}`)
        ])

        const routesStats = Array.isArray(routeStatsRes) ? routeStatsRes : []
        const routesToday = Array.isArray(routesTodayRes) ? routesTodayRes : []
        const deliveries = Array.isArray(deliveriesRes) ? deliveriesRes : []

        // 1. Pedidos Hoy (Total stops in today's routes)
        const pedidosHoy = routesToday.reduce((acc: number, r: any) => acc + (r.paradas?.length || 0), 0)

        // 2. Entregas Pendientes / Completadas
        const entregasPendientes = deliveries.filter((d: any) =>
            ['pendiente', 'en_ruta'].includes(d.estado)
        ).length

        const entregasCompletadas = deliveries.filter((d: any) =>
            ['entregado', 'entregado_completo', 'entregado_parcial'].includes(d.estado)
        ).length

        // 3. Rutas Activas
        const rutasActivas = routesStats.find((s: any) => s.estado === 'en_curso')?.count || 0

        // 4. Devoluciones (Placeholder if not implement yet)
        const devoluciones = 0

        return {
            pedidosHoy: Number(pedidosHoy),
            entregasPendientes: Number(entregasPendientes),
            entregasCompletadas: Number(entregasCompletadas),
            devolucionesAsignadas: devoluciones,
            rutasEnCurso: Number(rutasActivas),
            alertas: 0
        }
    } catch (error) {
        console.error('Error loading transportista dashboard stats:', error)
        return {
            pedidosHoy: 0,
            entregasPendientes: 0,
            entregasCompletadas: 0,
            devolucionesAsignadas: 0,
            rutasEnCurso: 0,
            alertas: 0
        }
    }
}
