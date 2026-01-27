import { useState, useEffect, useCallback } from 'react'
import { type ZonaComercial } from './zonasApi'
import type { ClienteRutero, RuteroPlanificado, DiaSemana, SucursalRutero } from './types'

interface RutaGuardada {
    zona_id: number
    zona_nombre: string
    dia_semana: DiaSemana
    clientes: RuteroPlanificado[]
}

const resolveZonaId = (cliente: Partial<ClienteRutero> | null | undefined): number | null => {
    if (!cliente) return null
    if (typeof cliente.zona_comercial_id === 'number') {
        return cliente.zona_comercial_id
    }
    const zonaObj = cliente.zona_comercial
    if (zonaObj && typeof zonaObj.id === 'number') {
        return zonaObj.id ?? null
    }
    return null
}

export function useRutero() {
    const [zonas, setZonas] = useState<ZonaComercial[]>([])
    const [zonaSeleccionada, setZonaSeleccionada] = useState<number | null>(null)
    const [diaSeleccionado, setDiaSeleccionado] = useState<DiaSemana>('LUNES')
    const [clientes, setClientes] = useState<ClienteRutero[]>([])
    const [ruteroActual, setRuteroActual] = useState<RuteroPlanificado[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [rutasGuardadas, setRutasGuardadas] = useState<RutaGuardada[]>([])
    const [isLoadingRutas, setIsLoadingRutas] = useState(false)
    const [ruteroIdSeleccionado, setRuteroIdSeleccionado] = useState<string | null>(null)

    useEffect(() => {
        setZonas([])
    }, [zonaSeleccionada])

    const cargarClientesRutero = useCallback(async () => {
        setIsLoading(false)
        setClientes([])
    }, [zonaSeleccionada, diaSeleccionado])

    const handleGuardar = useCallback(async (clientesSeleccionadosIds?: string[]) => {
        try {
            setIsSaving(true)
            setError(null)
            await cargarClientesRutero()
        } catch (err: any) {
            setError('Error al guardar rutero')
        } finally {
            setIsSaving(false)
        }
    }, [zonaSeleccionada, diaSeleccionado, cargarClientesRutero])

    const cargarRutasGuardadas = useCallback(async () => {
        setIsLoadingRutas(false)
        setRutasGuardadas([])
    }, [zonas])

    const handleSeleccionarRuta = useCallback((zonaId: number, dia: string, ruteroId?: string) => {
        setRuteroIdSeleccionado(ruteroId ?? null)
        setZonaSeleccionada(zonaId)
        setDiaSeleccionado(dia as DiaSemana)
        return null
    }, [])

    const handleReordenar = useCallback((clienteId: string, nuevoOrden: number) => { }, [])

    const handleActualizarHora = useCallback((clienteId: string, hora: string) => { }, [])

    const handleActualizarPrioridad = useCallback(
        (clienteId: string, prioridad: 'ALTA' | 'MEDIA' | 'BAJA') => { },
        [],
    )

    const handleActualizarFrecuencia = useCallback(
        (clienteId: string, frecuencia: 'SEMANAL' | 'QUINCENAL' | 'MENSUAL') => { },
        [],
    )

    const handleActualizarDireccion = useCallback(
        (clienteId: string, tipoDireccion: 'PRINCIPAL' | 'SUCURSAL', sucursalId?: string) => { },
        [],
    )

    const handleEliminarRuta = useCallback(
        async (zonaId: number, dia: string) => { },
        [],
    )

    return {
        zonas,
        zonaSeleccionada,
        setZonaSeleccionada,
        diaSeleccionado,
        setDiaSeleccionado,
        clientes,
        isLoading,
        isSaving,
        error,
        handleReordenar,
        handleActualizarHora,
        handleActualizarPrioridad,
        handleActualizarFrecuencia,
        handleActualizarDireccion,
        handleGuardar,
        recargar: cargarClientesRutero,
        rutasGuardadas,
        isLoadingRutas,
        cargarRutasGuardadas,
        handleSeleccionarRuta,
        handleEliminarRuta,
        ruteroIdSeleccionado,
        limpiarRuteroSeleccionado: () => setRuteroIdSeleccionado(null),
    }
}

export type { RutaGuardada }
