import { useState, useEffect, useCallback } from 'react'
import { getDashboardStats, DashboardStats } from '../../../services/dashboardApi'

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadStats = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getDashboardStats()
            setStats(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar estadísticas')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadStats()

        // Poll every 5 minutes
        const interval = setInterval(loadStats, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [loadStats])

    return { stats, loading, error, refresh: loadStats }
}
