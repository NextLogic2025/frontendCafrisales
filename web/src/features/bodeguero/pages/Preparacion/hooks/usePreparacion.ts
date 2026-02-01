import { useState, useCallback, useEffect } from 'react'
import { getRuterosPublicados, getRuteroConParadas, prepararParada } from '../../../services/logisticsApi'
import type { RuteroLogistico } from '../../../../supervisor/services/types'

export function usePreparacion() {
    const [ruteros, setRuteros] = useState<RuteroLogistico[]>([])
    const [selectedRutero, setSelectedRutero] = useState<RuteroLogistico | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const cargarRuteros = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await getRuterosPublicados()
            setRuteros(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar ruteros')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const verDetalleRutero = useCallback(async (id: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await getRuteroConParadas(id)
            setSelectedRutero(data)
        } catch (err: any) {
            setError(err.message || 'Error al cargar detalle del rutero')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const handlePrepararParada = useCallback(async (pedidoId: string) => {
        if (!selectedRutero) return

        try {
            await prepararParada(selectedRutero.id, pedidoId)
            // Actualizar el estado local para reflejar que está preparado
            if (selectedRutero.paradas) {
                const updatedParadas = selectedRutero.paradas.map(p =>
                    p.pedido_id === pedidoId
                        ? { ...p, preparado_en: new Date().toISOString(), preparado_por: 'Actual' }
                        : p
                )
                setSelectedRutero({ ...selectedRutero, paradas: updatedParadas })
            }
        } catch (err: any) {
            setError(err.message || 'Error al marcar como preparado')
        }
    }, [selectedRutero])

    useEffect(() => {
        cargarRuteros()
    }, [cargarRuteros])

    return {
        ruteros,
        selectedRutero,
        setSelectedRutero,
        isLoading,
        error,
        cargarRuteros,
        verDetalleRutero,
        handlePrepararParada,
    }
}
