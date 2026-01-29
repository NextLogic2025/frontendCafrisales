import { useState, useEffect, useCallback } from 'react'
import {
  type ZonaComercial,
  type CreateZonaDto,
  obtenerZonas,
  crearZona,
  actualizarZona,
} from './zonasApi'

export function useZonas() {
  const [zonas, setZonas] = useState<ZonaComercial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadZonas = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await obtenerZonas('todos') // Fetch all to keep inactive ones in table
      setZonas(data)
      setError(null)
    } catch (err: any) {
      setError(err?.message || 'Error al cargar zonas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadZonas()
  }, [loadZonas])

  const crearZonaSimple = async (
    zonaData: CreateZonaDto
  ) => {
    const nuevaZona = await crearZona(zonaData)
    return nuevaZona
  }

  const actualizarZonaSimple = async (
    zonaId: number | string,
    zonaData: Partial<CreateZonaDto>
  ) => {
    const actualizada = await actualizarZona(zonaId, zonaData)
    return actualizada
  }

  const toggleEstadoZona = async (zona: ZonaComercial) => {
    await actualizarZona(zona.id, { ...zona, activo: !zona.activo } as any)
  }

  return {
    zonas,
    isLoading,
    error,
    loadZonas,
    crearZona: crearZonaSimple,
    actualizarZona: actualizarZonaSimple,
    toggleEstadoZona,
  }
}
