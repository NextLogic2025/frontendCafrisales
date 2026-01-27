import { env } from '../../config/env'
import { getValidToken } from '../auth/authClient'

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

const USERS_API_URL = `${env.api.usuarios}/api`

export const channelsApi = {
    async getChannels(): Promise<Channel[]> {
        try {
            const token = await getValidToken()
            const headers: HeadersInit = {}
            if (token) headers.Authorization = `Bearer ${token}`

            const res = await fetch(`${USERS_API_URL}/canales`, { headers })
            if (!res.ok) return []
            const data = await res.json().catch(() => [])
            return Array.isArray(data) ? data : []
        } catch (error) {
            console.error('Error fetching channels:', error)
            return []
        }
    },

    async createChannel(payload: ChannelPayload): Promise<Channel | null> {
        try {
            const token = await getValidToken()
            if (!token) throw new Error('No hay sesión activa')

            const res = await fetch(`${USERS_API_URL}/canales`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const err = await res.json().catch(() => null)
                throw new Error(err?.message || 'Error al crear canal')
            }

            return await res.json()
        } catch (error) {
            console.error('Error creating channel:', error)
            throw error
        }
    },
}
