import * as React from 'react'
import { jwtDecode } from 'jwt-decode'
import { UserService } from '../services/api/UserService'
import { getValidToken } from '../services/auth/authClient'
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

  const [client, setClient] = React.useState<any | null>(null)
  const [clientLoading, setClientLoading] = React.useState(false)
  const [clientError, setClientError] = React.useState<string | null>(null)
  const [vendedorMap, setVendedorMap] = React.useState<Record<string, { id: string; nombre: string }>>({})

  const loadProfile = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    setClientLoading(true)
    setClientError(null)

    try {
      const token = await getValidToken()
      if (!token) {
        setLoading(false)
        return
      }

      const decoded = jwtDecode<any>(token)
      const userId = decoded.sub || decoded.userId
      const role = decoded.role || decoded.rol || ''

      const isClient = role.toUpperCase() === 'CLIENTE'

      const promises: Promise<any>[] = [UserService.getProfile()]
      if (isClient) {
        promises.push(obtenerClientePorId(userId))
      }

      const results = await Promise.all(promises)
      const data = results[0]
      let clientData = isClient ? results[1] : null

      if (data) {
        const mapped = {
          id: data.id,
          email: data.email,
          nombre: data.name,
          telefono: data.phone,
          avatarUrl: data.photoUrl,
          rol: { id: 0, nombre: data.role },
          activo: data.active,
          emailVerificado: (data as any).emailVerificado ?? false,
          createdAt: data.createdAt
        }
        setProfile(mapped)
      } else {
        setProfile(null)
      }

      if (isClient) {
        // Fallback logic for client
        if (!clientData) {
          try {
            const all = await obtenerClientes()
            if (all.length > 0) {
              clientData = all[0]
            }
          } catch (e) {
            console.error('Error fallback loading client', e)
          }
        }
        setClient(clientData)
      }

    } catch (e) {
      const message = e instanceof Error ? e.message : 'No se pudo obtener el perfil'
      setError(message)
    } finally {
      setLoading(false)
      setClientLoading(false)
    }
  }, [])

  const loadClient = React.useCallback(async (id: string) => {
    // Compatibility wrapper if called directly, though main logic is in loadProfile now
    setClientLoading(true)
    try {
      let data = await obtenerClientePorId(id)
      if (!data) {
        const all = await obtenerClientes()
        if (all.length > 0) data = all[0]
      }
      setClient(data)
    } catch (e) {
      setClientError(e instanceof Error ? e.message : 'Error')
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
    loadProfile()
  }, [loadProfile])

  // Removed the secondary useEffect for redundant client loading
  // React.useEffect(() => { ... }, [profile]) 

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
