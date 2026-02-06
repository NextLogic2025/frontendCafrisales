
import { env } from '../../config/env'
import { getValidToken, signOut } from '../auth/authClient'

export type ApiServiceOptions = RequestInit & {
    silent?: boolean
    auth?: boolean
}

function normalizeBody(body?: unknown) {
    if (body === undefined || body === null) return undefined
    return typeof body === 'string' ? body : JSON.stringify(body)
}

function headersToObject(headers?: HeadersInit): Record<string, string> {
    if (!headers) return {}
    if (Array.isArray(headers)) return Object.fromEntries(headers)
    if (headers instanceof Headers) return Object.fromEntries(headers.entries())
    return { ...(headers as Record<string, string>) }
}

async function apiRequest<T>(endpoint: string, options: ApiServiceOptions = {}): Promise<T> {
    const token = options.auth === false ? null : await getValidToken()

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headersToObject(options.headers),
        ...(token
            ? { Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}` }
            : {}),
    }

    const url = endpoint.startsWith('http') ? endpoint : `${env.api.catalogo}${endpoint}`

    let response: Response
    try {
        response = await fetch(url, {
            ...options,
            headers,
        })
    } catch (networkError) {
        console.error('Network Error:', networkError)
        throw new Error('Error de conexión')
    }

    if (!response.ok) {
        if (response.status === 401) {
            console.warn('Session expired (401)')
            await signOut()
            // Optional: redirect to login or show toast
            throw new Error('SESSION_EXPIRED')
        }

        const errorText = await response.text().catch(() => '')
        let errorPayload: any = null
        try {
            errorPayload = JSON.parse(errorText)
        } catch { }

        const message = errorPayload?.message || errorPayload?.error || `Error ${response.status}`
        throw new Error(message)
    }

    if (response.status === 204) {
        return {} as T
    }

    const text = await response.text().catch(() => '')
    if (!text) return {} as T

    try {
        return JSON.parse(text) as T
    } catch {
        return {} as T
    }
}

export const ApiService = {
    request: async <T>(endpoint: string, options: ApiServiceOptions = {}): Promise<T> => {
        return apiRequest<T>(endpoint, options)
    },
    get: async <T>(endpoint: string, options?: ApiServiceOptions): Promise<T> => {
        return ApiService.request(endpoint, { ...options, method: 'GET' })
    },
    post: async <T>(endpoint: string, body?: unknown, options?: ApiServiceOptions): Promise<T> => {
        return ApiService.request(endpoint, {
            ...options,
            method: 'POST',
            body: normalizeBody(body)
        })
    },
    put: async <T>(endpoint: string, body?: unknown, options?: ApiServiceOptions): Promise<T> => {
        return ApiService.request(endpoint, {
            ...options,
            method: 'PUT',
            body: normalizeBody(body)
        })
    },
    patch: async <T>(endpoint: string, body?: unknown, options?: ApiServiceOptions): Promise<T> => {
        return ApiService.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: normalizeBody(body)
        })
    },
    delete: async <T>(endpoint: string, options?: ApiServiceOptions): Promise<T> => {
        return ApiService.request(endpoint, { ...options, method: 'DELETE' })
    }
}
