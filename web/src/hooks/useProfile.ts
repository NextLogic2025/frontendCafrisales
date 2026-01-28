import * as React from 'react'
import { UserService } from '../services/api/UserService'
import { obtenerClientePorId, obtenerClientes } from '../features/supervisor/services/clientesApi'
import { obtenerVendedores } from '../features/supervisor/services/usuariosApi'

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
      console.log('useProfile: Raw UserService.getProfile result:', data)
      if (data) {
        const mapped = {
          id: data.id,
          email: data.email,
          nombre: data.name,
          telefono: data.phone,
          avatarUrl: data.photoUrl,
          rol: { id: 0, nombre: data.role },
          activo: data.active,
          emailVerificado: false,
          createdAt: undefined
        }
        console.log('useProfile: Mapped user profile:', mapped)
        setProfile(mapped)
      } else {
        setProfile(null)
      }
    } catch (e) {
      console.error('useProfile: Profile load error:', e)
      const message = e instanceof Error ? e.message : 'No se pudo obtener el perfil'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadClient = React.useCallback(async (id: string) => {
    console.log('useProfile: Attempting to load client for ID:', id)
    setClientLoading(true)
    setClientError(null)
    try {
      let data = await obtenerClientePorId(id)
      console.log('useProfile: obtenerClientePorId result:', data)

      // Fallback: Si no lo encuentra por ID, intentar listar (para el rol cliente esto debería devolver solo su registro)
      if (!data) {
        console.log('useProfile: ID lookup failed, trying fallback (obtenerClientes)...')
        const all = await obtenerClientes()
        console.log('useProfile: obtenerClientes result length:', all.length)
        if (all.length > 0) {
          data = all[0]
          console.log('useProfile: Fallback client selected:', data)
        }
      }

      setClient(data)
    } catch (e) {
      console.error('useProfile: Client load error:', e)
      setClientError(e instanceof Error ? e.message : 'Error al cargar datos del cliente')
    } finally {
      setClientLoading(false)
    }
  }, [])

  const loadVendedores = React.useCallback(async () => {
    try {
      const vendors = await obtenerVendedores()
      const map: Record<string, { id: string; nombre: string }> = {}
      vendors.forEach(v => {
        map[v.id] = v
      })
      setVendedorMap(map)
    } catch (e) {
      console.error('Error loading vendors map:', e)
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

  const updateClient = React.useCallback(async (_data: any) => { }, [])

  React.useEffect(() => {
    loadProfile().then(() => {
      // Optional: if profile is loaded and is client, load additional data
    })
  }, [loadProfile])

  React.useEffect(() => {
    if (profile?.rol?.nombre) {
      const roleName = profile.rol.nombre.trim().toUpperCase()
      console.log('useProfile: Checking role for data load. Role:', roleName)
      if (roleName === 'CLIENTE') {
        loadClient(profile.id)
        loadVendedores()
      }
    }
  }, [profile, loadClient, loadVendedores])

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
