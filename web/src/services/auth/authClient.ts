import { jwtDecode } from 'jwt-decode'
import { env } from '../../config/env'
import {
    clearToken,
    getRefreshToken,
    getToken,
    setRefreshToken,
    setToken,
    setUserName,
} from '../storage/tokenStorage'

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Error de conexión. Verifique su internet.',
    SERVER_UNAVAILABLE: 'Servidor no disponible. Intente más tarde.',
    INVALID_CREDENTIALS: 'Las credenciales son incorrectas.',
    ACCOUNT_DISABLED: 'Su cuenta ha sido desactivada.',
    PASSWORD_RESET_ERROR: 'No se pudo procesar la solicitud de recuperación.',
}

function logErrorForDebugging(error: unknown, context: string, meta?: Record<string, unknown>) {
    console.error(`[AuthError] ${context}:`, error, meta)
}

type SignedInUser = {
    id?: string
    email?: string
    nombre?: string
    role?: string | null
    rol?: string | null
}

type SignInApiResponse = {
    access_token?: string
    refresh_token?: string
    token?: string
    usuario?: SignedInUser
    usuario_id?: string
    rol?: string
    expires_in?: number
    message?: string
}

type RefreshApiResponse = {
    access_token?: string
    refresh_token?: string
    message?: string
}

type DecodedToken = {
    exp: number
    sub: string
    role?: string
    rol?: string
    userId?: string
}

export async function signIn(email: string, password: string) {
    const url = `${env.api.auth}/api/auth/login`

    let res: Response
    try {
        res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
    } catch (networkError) {
        logErrorForDebugging(networkError, 'signIn', { email })
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
    }

    const data = (await res.json().catch(() => null)) as SignInApiResponse | null

    if (!res.ok) {
        const backendMsg = typeof data?.message === 'string' ? data.message.toLowerCase() : ''

        if (
            res.status === 401 ||
            backendMsg.includes('credenciales') ||
            backendMsg.includes('inválid') ||
            backendMsg.includes('invalid')
        ) {
            throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS)
        }
        if (backendMsg.includes('desactivado') || backendMsg.includes('bloqueado')) {
            throw new Error(ERROR_MESSAGES.ACCOUNT_DISABLED)
        }

        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    const accessToken = data?.access_token || data?.token
    const refreshToken = data?.refresh_token

    if (!accessToken) {
        logErrorForDebugging(new Error('Missing token in response'), 'signIn', { data })
        throw new Error(ERROR_MESSAGES.SERVER_UNAVAILABLE)
    }

    setToken(accessToken)
    if (refreshToken) {
        setRefreshToken(refreshToken)
    }

    if (data?.usuario?.nombre) {
        setUserName(data.usuario.nombre)
    } else if (data?.usuario?.email) {
        setUserName(data.usuario.email)
    }

    const role =
        typeof data?.rol === 'string'
            ? data.rol
            : typeof data?.usuario?.role === 'string'
                ? data.usuario.role
                : typeof data?.usuario?.rol === 'string'
                    ? data.usuario.rol
                    : undefined

    const user =
        data?.usuario || data?.usuario_id || role
            ? {
                id: data?.usuario?.id || data?.usuario_id,
                email: data?.usuario?.email || email,
                nombre: data?.usuario?.nombre,
                role,
            }
            : undefined

    return { token: accessToken, user }
}

export async function getValidToken(): Promise<string | null> {
    const token = getToken()
    if (!token) return null

    try {
        const decoded = jwtDecode<DecodedToken>(token)
        // Check if exp is in the future (with 10s buffer)
        if (decoded.exp * 1000 > Date.now() + 10000) {
            return token
        }
    } catch {
        return null
    }

    // Token expired or invalid, try refresh
    return await refreshAccessToken()
}

const AUTH_PATHS = {
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
} as const

function normalizeTokenString(token: string) {
    return token.trim().replace(/^"|"$/g, '')
}

let refreshPromise: Promise<string | null> | null = null

export async function refreshAccessToken(): Promise<string | null> {
    if (refreshPromise) return refreshPromise

    refreshPromise = (async () => {
        const refreshToken = getRefreshToken()
        if (!refreshToken) {
            await signOut()
            return null
        }

        const url = `${env.api.auth}${AUTH_PATHS.refresh}`
        const cleanRefreshToken = normalizeTokenString(refreshToken)

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: cleanRefreshToken }),
            })

            if (!res.ok) {
                throw new Error('Refresh failed')
            }

            const data = (await res.json().catch(() => null)) as RefreshApiResponse | null
            const newAccessToken = data?.access_token
            const newRefreshToken = data?.refresh_token

            if (newAccessToken) {
                setToken(newAccessToken)
                if (newRefreshToken) setRefreshToken(newRefreshToken)
                return newAccessToken
            }
        } catch (error) {
            logErrorForDebugging(error, 'refreshAccessToken')
            clearToken()
        }
        return null
    })().finally(() => {
        refreshPromise = null
    })

    return refreshPromise
}

export async function signOut() {
    try {
        const refreshToken = getRefreshToken()
        const accessToken = getToken()
        if (refreshToken && accessToken) {
            const cleanToken = normalizeTokenString(refreshToken)
            const url = `${env.api.auth}${AUTH_PATHS.logout}`

            await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ refresh_token: cleanToken }),
            }).catch((err) => logErrorForDebugging(err, 'signOut.backendLogout'))
        }
    } catch (error) {
        logErrorForDebugging(error, 'signOut')
    } finally {
        clearToken()
    }
}
