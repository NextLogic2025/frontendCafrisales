import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'

export type Channel = {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  activo: boolean
}

export type ChannelPayload = {
  codigo: string
  nombre: string
  descripcion?: string
  activo?: boolean
}

export type ChannelStatusFilter = 'activo' | 'inactivo' | 'todos'

const USERS_BASE_URL = env.api.usersUrl
const USERS_API_URL = USERS_BASE_URL.endsWith('/api/v1')
  ? USERS_BASE_URL
  : USERS_BASE_URL.endsWith('/api')
    ? `${USERS_BASE_URL}/v1`
    : `${USERS_BASE_URL}/api/v1`

const rawService = {
  async getChannels(): Promise<Channel[]> {
    try {
      return await ApiService.get<Channel[]>(`${USERS_API_URL}/canales`)
    } catch (error) {
      logErrorForDebugging(error, 'ChannelService.getChannels')
      return []
    }
  },

  async getChannel(id: string): Promise<Channel | null> {
    try {
      return await ApiService.get<Channel>(`${USERS_API_URL}/canales/${id}`)
    } catch (error) {
      logErrorForDebugging(error, 'ChannelService.getChannel', { id })
      return null
    }
  },

  async createChannel(payload: ChannelPayload): Promise<Channel | null> {
    try {
      return await ApiService.post<Channel>(`${USERS_API_URL}/canales`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'ChannelService.createChannel')
      return null
    }
  },

  async updateChannel(id: string, payload: Partial<ChannelPayload>): Promise<Channel | null> {
    try {
      return await ApiService.patch<Channel>(`${USERS_API_URL}/canales/${id}`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'ChannelService.updateChannel', { id })
      return null
    }
  },

  async deleteChannel(id: string): Promise<boolean> {
    try {
      await ApiService.delete(`${USERS_API_URL}/canales/${id}`)
      return true
    } catch (error) {
      logErrorForDebugging(error, 'ChannelService.deleteChannel', { id })
      return false
    }
  },
}

export const ChannelService = createService('ChannelService', rawService)
