import { jwtDecode } from 'jwt-decode'

import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { getValidToken } from '../auth/authClient'
import { ERROR_MESSAGES, getUserFriendlyMessage, logErrorForDebugging } from '../../utils/errorMessages'

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

type StaffEntry = {
    usuario_id: string
    codigo_empleado?: string
    supervisor_id?: string | null
    numero_licencia?: string
    licencia_vence_en?: string
    activo?: boolean
}

const USERS_BASE_URL = env.api.usersUrl
const USERS_API_URL = USERS_BASE_URL.endsWith('/api') ? USERS_BASE_URL : `${USERS_BASE_URL}/api`
const AUTH_BASE_URL = env.auth.baseUrl || env.api.baseUrl
const AUTH_REGISTER_URL = `${AUTH_BASE_URL}/auth/register`

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

const roleIdMap: Record<number, string> = {
    1: 'admin',
    2: 'supervisor',
    3: 'bodeguero',
    4: 'vendedor',
    5: 'transportista',
    6: 'cliente'
}

function splitName(nombre: string) {
    const parts = nombre.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return { nombres: '', apellidos: '' }
    if (parts.length === 1) return { nombres: parts[0], apellidos: '' }
    return { nombres: parts.slice(0, parts.length - 1).join(' '), apellidos: parts[parts.length - 1] }
}

async function getCurrentUserId() {
    const token = await getValidToken()
    if (!token) return null
    try {
        const decoded = jwtDecode<DecodedToken>(token)
        return decoded.sub || decoded.userId || null
    } catch {
        return null
    }
}

async function fetchStaffEmployees(): Promise<UserProfile[]> {
    const [vendedores, bodegueros, transportistas] = await Promise.all([
        ApiService.get<StaffEntry[]>(`${USERS_API_URL}/staff/vendedores`),
        ApiService.get<StaffEntry[]>(`${USERS_API_URL}/staff/bodegueros`),
        ApiService.get<StaffEntry[]>(`${USERS_API_URL}/staff/transportistas`),
    ])

    const staff = [
        ...vendedores.map((item) => ({ ...item, rol: 'vendedor' })),
        ...bodegueros.map((item) => ({ ...item, rol: 'bodeguero' })),
        ...transportistas.map((item) => ({ ...item, rol: 'transportista' })),
    ]

    const userFetches = await Promise.all(
        staff.map(async (member) => {
            try {
                const user = await ApiService.get<UserApiUser>(`${USERS_API_URL}/usuarios/${member.usuario_id}`)
                return { id: member.usuario_id, user }
            } catch (error) {
                logErrorForDebugging(error, 'UserService.getUsers.staffUser', { userId: member.usuario_id })
                return { id: member.usuario_id, user: null }
            }
        })
    )

    const userMap = new Map(userFetches.map((entry) => [entry.id, entry.user]))

    return staff.map((member) => {
        const user = userMap.get(member.usuario_id)
        const email = user?.email || ''
        const role = (member as any).rol || user?.rol || 'Usuario'
        const active = member.activo ?? (user?.estado ? user.estado === 'activo' : true)
        const name = email || member.codigo_empleado || 'Sin nombre'

        return {
            id: member.usuario_id,
            name,
            role,
            email,
            phone: '',
            active,
            codigoEmpleado: member.codigo_empleado,
            numeroLicencia: member.numero_licencia,
            licenciaVenceEn: member.licencia_vence_en,
        }
    })
}

const rawService = {
    async getProfile(): Promise<UserProfile | null> {
        try {
            const token = await getValidToken()
            if (!token) return null
            const decoded = jwtDecode<DecodedToken>(token)
            const userId = decoded.sub || decoded.userId
            if (!userId) return null

            const user = await ApiService.get<UserApiUser>(`${USERS_API_URL}/usuarios/${userId}`)
            let profile: UserApiProfile | null = null
            try {
                profile = await ApiService.get<UserApiProfile>(`${USERS_API_URL}/usuarios/me/perfil`)
            } catch (error) {
                logErrorForDebugging(error, 'UserService.getProfile.profile')
            }

            return normalizeUser(user, profile)
        } catch (error) {
            logErrorForDebugging(error, 'UserService.getProfile')
            return null
        }
    },

    async updateProfile(_userId: string, data: { nombre: string; telefono: string }): Promise<boolean> {
        try {
            const nameParts = splitName(data.nombre)
            await ApiService.put(`${USERS_API_URL}/usuarios/me/perfil`, {
                nombres: nameParts.nombres,
                apellidos: nameParts.apellidos,
                telefono: data.telefono || null
            })
            return true
        } catch (error) {
            logErrorForDebugging(error, 'UserService.updateProfile')
            return false
        }
    },

    async createUser(userData: CreateUserPayload): Promise<{ success: boolean; message?: string; userId?: string }> {
        try {
            const token = await getValidToken()
            if (!token) {
                return { success: false, message: ERROR_MESSAGES.SESSION_EXPIRED }
            }
            const roleFromId = userData.rolId ? roleIdMap[userData.rolId] : undefined
            const rol = (userData.rol || roleFromId || '').toLowerCase()
            const { nombres, apellidos } = splitName(userData.nombre || '')
            const currentUserId = await getCurrentUserId()
            const codigoEmpleado = userData.codigoEmpleado?.trim()

            const payload: Record<string, any> = {
                email: userData.email,
                password: userData.password,
                rol
            }

            if (nombres || apellidos || userData.telefono) {
                payload.perfil = {
                    nombres,
                    apellidos,
                    telefono: userData.telefono || undefined
                }
            }

            if (currentUserId) {
                payload.creado_por = currentUserId
            }

            if (rol === 'supervisor' && codigoEmpleado) {
                payload.supervisor = { codigo_empleado: codigoEmpleado }
            }

            if (rol === 'bodeguero' && codigoEmpleado) {
                payload.bodeguero = { codigo_empleado: codigoEmpleado }
            }

            if (rol === 'vendedor' && codigoEmpleado) {
                payload.vendedor = {
                    codigo_empleado: codigoEmpleado,
                    supervisor_id: userData.supervisorId || currentUserId || null
                }
            }

            if (rol === 'transportista' && codigoEmpleado) {
                payload.transportista = {
                    codigo_empleado: codigoEmpleado,
                    numero_licencia: userData.numeroLicencia,
                    licencia_vence_en: userData.licenciaVenceEn || null
                }
            }

            const response = await ApiService.post<{ id?: string; userId?: string }>(AUTH_REGISTER_URL, payload)
            return {
                success: true,
                message: 'Usuario creado exitosamente',
                userId: response.id || response.userId
            }
        } catch (error: any) {
            logErrorForDebugging(error, 'UserService.createUser', { email: userData.email })
            return { success: false, message: getUserFriendlyMessage(error, 'CREATE_ERROR') }
        }
    },

    async getUsers(): Promise<UserProfile[]> {
        try {
            return await fetchStaffEmployees()
        } catch (error) {
            logErrorForDebugging(error, 'UserService.getUsers.staff')
            return []
        }
    },

    async getVendors(): Promise<UserProfile[]> {
        const users = await rawService.getUsers()
        return users.filter((user) => user.role.toLowerCase().includes('vend'))
    },

    async updateUser(
        userId: string,
        data: Partial<{
            nombre: string
            activo: boolean
            rolId: number
            rol: string
            codigoEmpleado: string
            supervisorId: string
            numeroLicencia: string
            licenciaVenceEn: string
        }>,
    ): Promise<{ success: boolean; message?: string }> {
        try {
            const payload: Record<string, unknown> = {}
            const roleFromId = data.rolId ? roleIdMap[data.rolId] : undefined
            const rol = (data.rol || roleFromId || '').toLowerCase()
            const codigo = data.codigoEmpleado?.trim()
            if (rol) payload.rol = rol
            if (data.activo !== undefined) payload.estado = data.activo ? 'activo' : 'inactivo'

            if (rol === 'supervisor' && codigo) {
                payload.supervisor = { codigo_empleado: codigo }
            }

            if (rol === 'bodeguero' && codigo) {
                payload.bodeguero = { codigo_empleado: codigo }
            }

            if (rol === 'vendedor' && codigo) {
                payload.vendedor = {
                    codigo_empleado: codigo,
                    supervisor_id: data.supervisorId || undefined,
                }
            }

            if (rol === 'transportista' && codigo) {
                payload.transportista = {
                    codigo_empleado: codigo,
                    numero_licencia: data.numeroLicencia,
                    licencia_vence_en: data.licenciaVenceEn || null,
                }
            }

            if (Object.keys(payload).length > 0) {
                await ApiService.patch(`${USERS_API_URL}/usuarios/${userId}`, payload)
            }
            return { success: true, message: 'Usuario actualizado correctamente' }
        } catch (error: any) {
            logErrorForDebugging(error, 'UserService.updateUser', { userId })
            return { success: false, message: getUserFriendlyMessage(error, 'UPDATE_ERROR') }
        }
    },

    async deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
        try {
            await ApiService.patch(`${USERS_API_URL}/usuarios/${userId}`, { estado: 'inactivo' })
            return { success: true, message: 'Usuario desactivado correctamente' }
        } catch (error: any) {
            logErrorForDebugging(error, 'UserService.deleteUser', { userId })
            return { success: false, message: getUserFriendlyMessage(error, 'DELETE_ERROR') }
        }
    }
}

export const UserService = createService('UserService', rawService)

export interface CreateUserPayload {
    email: string
    password: string
    nombre: string
    telefono?: string
    rolId?: number
    rol?: string
    codigoEmpleado?: string
    supervisorId?: string
    numeroLicencia?: string
    licenciaVenceEn?: string
}
