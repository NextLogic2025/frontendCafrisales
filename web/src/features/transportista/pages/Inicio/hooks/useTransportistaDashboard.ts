// web/src/features/transportista/pages/Inicio/hooks/useTransportistaDashboard.ts
import { useState, useCallback, useEffect, useRef } from 'react'
import { getTransportistaDashboardStats, type TransportistaDashboardStats } from '../../../services/transportistaDashboardApi'

export function useTransportistaDashboard() {
    const [stats, setStats] = useState<TransportistaDashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const pollingRef = useRef<any>(null)

    const fetchStats = useCallback(async (isManual = false) => {
        if (isManual) setLoading(true)
        setError(null)
        try {
            const data = await getTransportistaDashboardStats()
            setStats(data)
        } catch (err: any) {
            console.error('Error fetching transportista dashboard stats:', err)
            setError(err?.message || 'Error al conectar con los servicios logísticos')
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
        refresh
    }
}
