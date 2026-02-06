import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'

export interface DashboardStats {
    pedidosHoy: number
    enValidacion: number
    entregasPendientes: number
    alertasActivas: number
    indicadoresRiesgo: {
        tipo: 'peligro' | 'advertencia' | 'info'
        mensaje: string
    }[]
}

const GATEWAY_URL = env.api.orders // Both orders and delivery use same gateway

export async function getDashboardStats(): Promise<DashboardStats> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const headers = {
        Authorization: `Bearer ${token}`,
        'X-Authorization': `Bearer ${token}`
    }

    try {
        const [ordersStatsRes, pendingValidationRes, deliveriesRes, alertsRes] = await Promise.all([
            // 1. Orders Today (All orders with status)
            fetch(`${GATEWAY_URL}/api/v1/orders/stats`, { headers }).then(r => r.ok ? r.json() : []),

            // 2. Pending Validation
            fetch(`${GATEWAY_URL}/api/v1/orders?limit=1&status=pendiente_validacion`, { headers }).then(r => r.ok ? r.json() : { meta: { totalItems: 0 } }),

            // 3. Pending Deliveries
            fetch(`${GATEWAY_URL}/api/v1/deliveries?limit=1&status=pendiente,en_ruta`, { headers }).then(r => r.ok ? r.json() : { meta: { totalItems: 0 } }),

            // 4. Active Alerts
            fetch(`${GATEWAY_URL}/api/v1/deliveries?limit=1&hasIncidents=true`, { headers }).then(r => r.ok ? r.json() : { meta: { totalItems: 0 } })
        ])

        // Calculate Pedidos Hoy from stats
        const totalOrders = (ordersStatsRes || []).reduce((acc: number, curr: any) => acc + Number(curr.count || 0), 0)

        // Extract metadata counts from paginated responses
        const enValidacion = pendingValidationRes.meta?.totalItems ?? (Array.isArray(pendingValidationRes) ? pendingValidationRes.length : 0)
        const entregasPendientes = deliveriesRes.meta?.totalItems ?? (Array.isArray(deliveriesRes) ? deliveriesRes.length : 0)
        const alertasActivas = alertsRes.meta?.totalItems ?? (Array.isArray(alertsRes) ? alertsRes.length : 0)

        // Construct mock risk indicators if no specific endpoint exists yet
        const indicadoresRiesgo: DashboardStats['indicadoresRiesgo'] = []
        if (alertasActivas > 0) {
            indicadoresRiesgo.push({
                tipo: 'peligro',
                mensaje: `${alertasActivas} entregas con incidencias activas`
            })
        }
        if (enValidacion > 0) {
            indicadoresRiesgo.push({
                tipo: 'advertencia',
                mensaje: `${enValidacion} pedidos pendientes de validación`
            })
        }

        return {
            pedidosHoy: totalOrders,
            enValidacion,
            entregasPendientes,
            alertasActivas,
            indicadoresRiesgo
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error)
        return {
            pedidosHoy: 0,
            enValidacion: 0,
            entregasPendientes: 0,
            alertasActivas: 0,
            indicadoresRiesgo: []
        }
    }
}
