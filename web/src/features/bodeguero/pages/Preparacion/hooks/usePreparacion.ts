import { useState, useCallback, useEffect } from 'react'
import { getRuterosPublicados, getRuteroConParadas, prepararParada } from '../../../services/logisticsApi'
import { obtenerZonas } from '../../../../supervisor/services/clientesApi'
import { getVehicles } from '../../../../supervisor/services/vehiclesApi'
import { getUserById } from '../../../../supervisor/services/usuariosApi'
import { obtenerPedidoPorId } from '../../../../supervisor/services/pedidosApi'
import type { RuteroLogistico, ParadaRutero } from '../../../../supervisor/services/types'

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

            // Enrich data manually
            const [zonas, allVehicles] = await Promise.all([
                obtenerZonas().catch(() => []),
                getVehicles().catch(() => [])
            ])

            const enrichedData = await Promise.all(data.map(async (r) => {
                let transportista = r.transportista
                let vehiculo = r.vehiculo
                const zona = zonas.find(z => String(z.id) === String(r.zona_id))

                // Transportista
                if (!transportista && r.transportista_id) {
                    try {
                        const u = await getUserById(r.transportista_id)
                        if (u) {
                            transportista = {
                                id: u.id,
                                nombre: u.perfil?.nombres || 'Sin nombre',
                                apellido: u.perfil?.apellidos || '',
                                email: u.email
                            }
                        }
                    } catch (e) { }
                }

                // Vehiculo
                if (!vehiculo && r.vehiculo_id) {
                    const found = allVehicles.find(v => v.id === r.vehiculo_id)
                    if (found) {
                        vehiculo = {
                            id: found.id,
                            placa: found.placa,
                            modelo: found.modelo,
                            capacidad_kg: found.capacidad_kg,
                            estado: found.estado
                        }
                    }
                }

                return {
                    ...r,
                    transportista,
                    vehiculo,
                    zona: zona ? { id: zona.id, nombre: zona.nombre } : r.zona
                }
            }))

            setRuteros(enrichedData)
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
            if (!data) return

            // Enrich detail
            const [zonas, allVehicles] = await Promise.all([
                obtenerZonas().catch(() => []),
                getVehicles().catch(() => [])
            ])

            let transportista = data.transportista
            let vehiculo = data.vehiculo
            const zona = zonas.find(z => String(z.id) === String(data.zona_id))

            if (!transportista && data.transportista_id) {
                const u = await getUserById(data.transportista_id).catch(() => null)
                if (u) {
                    transportista = {
                        id: u.id,
                        nombre: u.perfil?.nombres || 'Sin nombre',
                        apellido: u.perfil?.apellidos || '',
                        email: u.email
                    }
                }
            }

            if (!vehiculo && data.vehiculo_id) {
                const found = allVehicles.find(v => v.id === data.vehiculo_id)
                if (found) {
                    vehiculo = {
                        id: found.id,
                        placa: found.placa,
                        modelo: found.modelo,
                        capacidad_kg: found.capacidad_kg,
                        estado: found.estado
                    }
                }
            }

            // Enrich Paradas (Pedido info)
            const hydratedParadas = await Promise.all(
                (data.paradas || []).map(async (p: ParadaRutero) => {
                    try {
                        const pedidoFull = await obtenerPedidoPorId(p.pedido_id)
                        return {
                            ...p,
                            pedido: pedidoFull ? {
                                id: pedidoFull.id,
                                numero_pedido: pedidoFull.codigo_visual || pedidoFull.id,
                                cliente_id: pedidoFull.cliente_id || '',
                                cliente_nombre: pedidoFull.cliente?.razon_social || 'Cliente',
                                direccion_entrega: pedidoFull.cliente?.direccion_texto || pedidoFull.cliente?.identificacion || 'Dirección no disponible',
                                total: pedidoFull.total_final,
                            } : p.pedido
                        }
                    } catch (e) {
                        return p
                    }
                })
            )

            setSelectedRutero({
                ...data,
                transportista,
                vehiculo,
                zona: zona ? { id: zona.id, nombre: zona.nombre } : data.zona,
                paradas: hydratedParadas
            })
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
