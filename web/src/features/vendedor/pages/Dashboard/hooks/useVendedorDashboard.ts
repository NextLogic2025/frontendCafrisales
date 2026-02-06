import { useState, useEffect, useCallback } from 'react'
import { getVendedorDashboardStats, VendedorDashboardStats } from '../../../services/vendedorDashboardApi'

export function useVendedorDashboard() {
    const [stats, setStats] = useState<VendedorDashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadStats = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getVendedorDashboardStats()
            setStats(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar estadísticas')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadStats()
        const interval = setInterval(loadStats, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [loadStats])

    return { stats, loading, error, refresh: loadStats }
}
