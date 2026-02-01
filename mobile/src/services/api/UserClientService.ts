import { env } from '../../config/env'
import { getValidToken } from '../auth/authClient'
import { jwtDecode } from 'jwt-decode'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'
import { isApiError } from './ApiError'

export type ClientStatusFilter = 'activo' | 'inactivo' | 'todos'

export type UserClient = {
  usuario_id: string
  email?: string
  estado?: string
  nombres?: string | null
  apellidos?: string | null
  telefono?: string | null
  canal_id: string
  canal_nombre?: string | null
  canal_codigo?: string | null
  nombre_comercial: string
  ruc?: string | null
  zona_id: string
  direccion: string
  latitud?: number | null
  longitud?: number | null
  vendedor_asignado_id?: string | null
  creado_en?: string
  creado_por?: string | null
}

export type UpdateUserClientPayload = Partial<{
  canal_id: string
  nombre_comercial: string
  ruc?: string | null
  zona_id: string
  direccion: string
  latitud?: number | null
  longitud?: number | null
  vendedor_asignado_id?: string | null
}>

type ClientConditions = {
  permite_negociacion?: boolean | null
  max_descuento_porcentaje?: number | null
  requiere_aprobacion_supervisor?: boolean | null
}

const USERS_BASE_URL = env.api.usersUrl
const USERS_API_URL = USERS_BASE_URL.endsWith('/api/v1')
  ? USERS_BASE_URL
  : USERS_BASE_URL.endsWith('/api')
    ? `${USERS_BASE_URL}/v1`
    : `${USERS_BASE_URL}/api/v1`

const normalizeClient = (client: UserClient): UserClient => ({
  ...client,
  latitud: client.latitud !== null && client.latitud !== undefined ? Number(client.latitud) : null,
  longitud: client.longitud !== null && client.longitud !== undefined ? Number(client.longitud) : null,
})

const rawService = {
  async getClients(status: ClientStatusFilter = 'activo'): Promise<UserClient[]> {
    try {
      const query = status ? `?estado=${encodeURIComponent(status)}` : ''
      const data = await ApiService.get<UserClient[]>(`${USERS_API_URL}/clientes${query}`)
      return data.map(normalizeClient)
    } catch (error) {
      logErrorForDebugging(error, 'UserClientService.getClients')
      return []
    }
  },

  async getClientsByVendedor(vendedorId: string): Promise<UserClient[]> {
    try {
      const data = await ApiService.get<UserClient[]>(`${USERS_API_URL}/vendedores/${vendedorId}/clientes`)
      return data.map(normalizeClient)
    } catch (error) {
      logErrorForDebugging(error, 'UserClientService.getClientsByVendedor', { vendedorId })
      return []
    }
  },

  async getClient(usuarioId: string): Promise<UserClient | null> {
    try {
      const client = await ApiService.get<UserClient>(`${USERS_API_URL}/clientes/${usuarioId}`)
      return normalizeClient(client)
    } catch (error) {
      if (isApiError(error) && error.status === 403) {
        return await rawService.getClientForVendedor(usuarioId)
      }
      logErrorForDebugging(error, 'UserClientService.getClient', { usuarioId })
      return null
    }
  },

  async updateClient(usuarioId: string, payload: UpdateUserClientPayload): Promise<UserClient | null> {
    try {
      const client = await ApiService.patch<UserClient>(`${USERS_API_URL}/clientes/${usuarioId}`, payload)
      return normalizeClient(client)
    } catch (error) {
      logErrorForDebugging(error, 'UserClientService.updateClient', { usuarioId })
      return null
    }
  },

  async updateCondiciones(usuarioId: string, payload: Record<string, any>) {
    try {
      return await ApiService.put(`${USERS_API_URL}/clientes/${usuarioId}/condiciones-comerciales`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'UserClientService.updateCondiciones', { usuarioId })
      return null
    }
  },

  async getClientConditions(usuarioId: string): Promise<ClientConditions | null> {
    try {
      return await ApiService.get<ClientConditions>(`${USERS_API_URL}/clientes/${usuarioId}/condiciones`, { silent: true })
    } catch (error) {
      logErrorForDebugging(error, 'UserClientService.getClientConditions', { usuarioId })
      return null
    }
  },

  async getClientForVendedor(clienteId: string): Promise<UserClient | null> {
    try {
      const token = await getValidToken()
      if (!token) return null
      const decoded = jwtDecode<{ sub?: string; userId?: string }>(token)
      const vendedorId = decoded.sub || decoded.userId
      if (!vendedorId) return null
      const clients = await rawService.getClientsByVendedor(vendedorId)
      return clients.find((client) => client.usuario_id === clienteId) || null
    } catch (error) {
      logErrorForDebugging(error, 'UserClientService.getClientForVendedor', { clienteId })
      return null
    }
  },
}

export const UserClientService = createService('UserClientService', rawService)
