import { useState, useCallback, useEffect, useRef } from 'react'
import { getBodegueroDashboardStats, type BodegueroDashboardStats } from '../../../services/bodegueroDashboardApi'

export function useBodegueroDashboard() {
    const [stats, setStats] = useState<BodegueroDashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

    const pollingRef = useRef<any>(null)

    const fetchStats = useCallback(async (isManual = false) => {
        if (isManual) setLoading(true)
        setError(null)
        try {
            const data = await getBodegueroDashboardStats()
            setStats(data)
            setLastUpdate(new Date())
        } catch (err: any) {
            console.error('Error fetching bodeguero dashboard stats:', err)
            setError(err?.message || 'Error al conectar con el servidor de inventario')
        } finally {
            setLoading(false)
        }
    }, [])

    const refresh = () => fetchStats(true)

    useEffect(() => {
        fetchStats()

        // Auto-refresh every 5 minutes
        pollingRef.current = setInterval(() => {
            fetchStats()
        }, 1000 * 60 * 5)

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
        }
    }, [fetchStats])

    return {
        stats,
        loading,
        error,
        lastUpdate,
        refresh
    }
}
