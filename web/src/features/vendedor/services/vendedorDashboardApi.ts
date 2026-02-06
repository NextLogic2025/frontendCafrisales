import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'
import { jwtDecode } from 'jwt-decode'

export interface VendedorDashboardStats {
    pedidosDia: number
    ventasAcumuladas: number
    clientesActivos: number
    visitasHoy: number
    alertasComerciales: {
        rechazados: number
        vencidos: number
    }
    agenda: any[]
}

const ORDERS_URL = env.api.orders
const USERS_URL = env.api.usuarios
const ROUTES_URL = env.api.routes
const CREDITS_URL = env.api.creditos

async function getVendedorId(): Promise<string | null> {
    const token = await getValidToken()
    if (!token) return null
    try {
        const decoded = jwtDecode<{ sub?: string; userId?: string }>(token)
        return decoded.sub || decoded.userId || null
    } catch {
        return null
    }
}

export async function getVendedorDashboardStats(): Promise<VendedorDashboardStats> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')
    const vendedorId = await getVendedorId()

    const headers = {
        Authorization: `Bearer ${token}`,
        'X-Authorization': `Bearer ${token}`
    }

    const today = new Date().toISOString().split('T')[0]

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
        const [ordersRes, clientsRes, routesRes, creditsRes] = await Promise.all([
            // 1. Orders Stats
            robustFetch(`${ORDERS_URL}/api/v1/orders/stats`),

            // 2. Clients assigned to vendor
            vendedorId
                ? robustFetch(`${USERS_URL}/api/v1/vendedores/${vendedorId}/clientes`)
                : Promise.resolve([]),

            // 3. Routes for today
            robustFetch(`${ROUTES_URL}/api/v1/ruteros-comerciales?fecha_desde=${today}`),

            // 4. Overdue credits (Pattern matching creditosApi.ts)
            vendedorId
                ? robustFetch(`${CREDITS_URL}/api/v1/credits?sellerId=${vendedorId}&status=activo,vencido`)
                : Promise.resolve([])
        ])

        const ordersStats = Array.isArray(ordersRes) ? ordersRes : []
        const clients = Array.isArray(clientsRes) ? clientsRes : []
        const routes = Array.isArray(routesRes) ? routesRes : []
        const credits = Array.isArray(creditsRes) ? creditsRes : []

        // Process Orders
        const totalOrders = ordersStats.reduce((acc: number, curr: any) => acc + Number(curr.count || 0), 0)
        const totalAmount = ordersStats.reduce((acc: number, curr: any) => acc + Number(curr.totalAmount || 0), 0)

        // Process Clients
        const activeClients = clients.filter((c: any) =>
            String(c.estado || '').toLowerCase() === 'activo' ||
            c.activo === true ||
            (!c.bloqueado && !c.deleted_at)
        ).length

        // Process Routes/Agenda
        const totalVisits = routes.reduce((acc: number, curr: any) => acc + (curr.visitas?.length || 0), 0)

        // Process Alertas
        const rechazados = ordersStats.find((s: any) =>
            ['rechazado_cliente', 'anulado', 'rechazado'].includes(String(s.estado || '').toLowerCase())
        )?.count || 0

        const vencidos = credits.filter((c: any) =>
            String(c.estado || '').toUpperCase() === 'VENCIDO' ||
            Number(c.dias_mora || 0) > 0
        ).length

        return {
            pedidosDia: totalOrders,
            ventasAcumuladas: totalAmount,
            clientesActivos: activeClients > 0 ? activeClients : clients.length,
            visitasHoy: totalVisits,
            alertasComerciales: {
                rechazados: Number(rechazados),
                vencidos: Number(vencidos)
            },
            agenda: routes
        }
    } catch (error) {
        console.error('Error in getVendedorDashboardStats:', error)
        return {
            pedidosDia: 0,
            ventasAcumuladas: 0,
            clientesActivos: 0,
            visitasHoy: 0,
            alertasComerciales: { rechazados: 0, vencidos: 0 },
            agenda: []
        }
    }
}
