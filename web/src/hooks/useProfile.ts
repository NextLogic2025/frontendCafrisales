import * as React from 'react'

// Mock interfaces to replace deleted API types
export interface UserProfile {
  id: string
  email: string
  nombre: string
  rol: {
    id: number
    nombre: string
  }
  avatarUrl?: string | null
  telefono?: string | null
}

export function useProfile() {
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [client, setClient] = React.useState<any | null>(null)
  const [clientLoading, setClientLoading] = React.useState(false)
  const [clientError, setClientError] = React.useState<string | null>(null)
  const [vendedorMap, setVendedorMap] = React.useState<Record<string, { id: string; nombre: string }>>({})

  const loadProfile = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Mock profile data for UI only
      setProfile(null)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo obtener el perfil'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadClient = React.useCallback(async () => {
    if (!profile?.id) return
    setClientLoading(true)
    setClientError(null)
    try {
      setClient(null)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo obtener el cliente'
      setClientError(message)
    } finally {
      setClientLoading(false)
    }
  }, [profile?.id])

  const loadVendedores = React.useCallback(async () => {
    try {
      setVendedorMap({})
    } catch (e) {
      console.error('Error al cargar vendedores:', e)
    }
  }, [])

  const updateProfile = React.useCallback(async (data: { nombre?: string; telefono?: string | null; avatarUrl?: string | null }) => {
    if (!profile?.id) throw new Error('No hay perfil cargado')
    try {
      setProfile(prev => prev ? ({ ...prev, ...data }) : null)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo actualizar el perfil'
      setError(message)
      throw e
    }
  }, [profile?.id])

  const updateClient = React.useCallback(async (data: { identificacion?: string | null; tipo_identificacion?: string | null; razon_social?: string | null; nombre_comercial?: string | null }) => {
    // No-op
  }, [client])

  React.useEffect(() => {
    loadProfile()
  }, [loadProfile])

  React.useEffect(() => {
    const rol = profile?.rol?.nombre?.toLowerCase?.()
    if (rol === 'admin' || rol === 'supervisor') {
      loadVendedores()
    }
  }, [profile?.rol?.nombre, loadVendedores])

  return {
    profile,
    loading,
    error,
    refresh: loadProfile,
    updateProfile,
    client,
    clientLoading,
    clientError,
    vendedorMap,
    updateClient,
  }
}
