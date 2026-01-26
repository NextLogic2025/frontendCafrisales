import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'

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

const USERS_BASE_URL = env.api.usersUrl
const USERS_API_URL = USERS_BASE_URL.endsWith('/api') ? USERS_BASE_URL : `${USERS_BASE_URL}/api`

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

  async getClient(usuarioId: string): Promise<UserClient | null> {
    try {
      const client = await ApiService.get<UserClient>(`${USERS_API_URL}/clientes/${usuarioId}`)
      return normalizeClient(client)
    } catch (error) {
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
}

export const UserClientService = createService('UserClientService', rawService)
