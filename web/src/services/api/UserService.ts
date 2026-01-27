import { jwtDecode } from 'jwt-decode'
import { env } from '../../config/env'
import { getValidToken } from '../auth/authClient'

export interface UserProfile {
    id: string
    name: string
    role: string
    email: string
    phone: string
    photoUrl?: string
    active: boolean
    lastLogin?: string
    codigoEmpleado?: string
    numeroLicencia?: string
    licenciaVenceEn?: string
}

type DecodedToken = {
    sub?: string
    userId?: string
    role?: string
}

type UserApiUser = {
    id?: string
    email?: string
    rol?: string
    estado?: 'activo' | 'inactivo' | 'suspendido'
}

type UserApiProfile = {
    nombres?: string
    apellidos?: string
    telefono?: string
    url_avatar?: string
}

const USERS_BASE_URL = env.api.usuarios
const USERS_API_URL = USERS_BASE_URL.endsWith('/api') ? USERS_BASE_URL : `${USERS_BASE_URL}/api`

const normalizeUser = (user: UserApiUser, profile?: UserApiProfile | null): UserProfile => {
    const fullName = [profile?.nombres, profile?.apellidos].filter(Boolean).join(' ').trim()
    return {
        id: user.id || '',
        name: fullName || user.email || 'Sin nombre',
        role: user.rol || 'Usuario',
        email: user.email || '',
        phone: profile?.telefono || '',
        photoUrl: profile?.url_avatar,
        active: user.estado ? user.estado === 'activo' : true,
        lastLogin: undefined
    }
}

function splitName(nombre: string) {
    const parts = nombre.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return { nombres: '', apellidos: '' }
    if (parts.length === 1) return { nombres: parts[0], apellidos: '' }
    return { nombres: parts.slice(0, parts.length - 1).join(' '), apellidos: parts[parts.length - 1] }
}

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || `Error ${res.status}: ${res.statusText}`)
    }

    return await res.json()
}

export const UserService = {
    async getProfile(): Promise<UserProfile | null> {
        try {
            const token = await getValidToken()
            if (!token) return null
            const decoded = jwtDecode<DecodedToken>(token)
            const userId = decoded.sub || decoded.userId
            if (!userId) return null

            const user = await apiRequest<UserApiUser>(`${USERS_API_URL}/usuarios/${userId}`)
            let profile: UserApiProfile | null = null
            try {
                profile = await apiRequest<UserApiProfile>(`${USERS_API_URL}/usuarios/me/perfil`)
            } catch (error) {
                console.error('UserService.getProfile.profile error', error)
            }

            return normalizeUser(user, profile)
        } catch (error) {
            console.error('UserService.getProfile error', error)
            return null
        }
    },

    async updateProfile(_userId: string, data: { nombre: string; telefono: string }): Promise<boolean> {
        try {
            const nameParts = splitName(data.nombre)
            await apiRequest(`${USERS_API_URL}/usuarios/me/perfil`, {
                method: 'PUT',
                body: JSON.stringify({
                    nombres: nameParts.nombres,
                    apellidos: nameParts.apellidos,
                    telefono: data.telefono || null
                })
            })
            return true
        } catch (error) {
            console.error('UserService.updateProfile error', error)
            return false
        }
    },
}
