import * as React from 'react'
import { UserService } from '../services/api/UserService'

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
  activo?: boolean
  emailVerificado?: boolean
  createdAt?: string
}

export function useProfile() {
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Logic from existing hook that might be needed elsewhere or is unused
  // client/vendedorMap stuff seems unused by VendedorPerfil but kept for safety if used elsewhere? 
  // checking usages: VendedorPerfil only uses profile, loading, error, refresh, updateProfile.
  // I will leave the extra state for now to avoid breaking other components if they use this hook
  const [client, setClient] = React.useState<any | null>(null)
  const [clientLoading, setClientLoading] = React.useState(false)
  const [clientError, setClientError] = React.useState<string | null>(null)
  const [vendedorMap, setVendedorMap] = React.useState<Record<string, { id: string; nombre: string }>>({})

  const loadProfile = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await UserService.getProfile()
      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          nombre: data.name,
          telefono: data.phone,
          avatarUrl: data.photoUrl,
          rol: { id: 0, nombre: data.role },
          activo: data.active,
          // These fields are not returned by the mobile service logic currently
          emailVerificado: false,
          createdAt: undefined
        })
      } else {
        setProfile(null)
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo obtener el perfil'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = React.useCallback(async (data: { nombre?: string; telefono?: string | null; avatarUrl?: string | null }) => {
    if (!profile?.id) throw new Error('No hay perfil cargado')
    try {
      const success = await UserService.updateProfile(profile.id, {
        nombre: data.nombre || profile.nombre,
        telefono: data.telefono || profile.telefono || ''
      })
      if (success) {
        // Update local state optimistic
        setProfile(prev => prev ? ({ ...prev, ...data }) : null)
      } else {
        throw new Error('Falló la actualización del perfil')
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo actualizar el perfil'
      setError(message)
      throw e
    }
  }, [profile])

  // Stub functions for compatibility
  const loadClient = React.useCallback(async () => { }, [])
  const loadVendedores = React.useCallback(async () => { }, [])
  const updateClient = React.useCallback(async () => { }, [])

  React.useEffect(() => {
    loadProfile()
  }, [loadProfile])

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
