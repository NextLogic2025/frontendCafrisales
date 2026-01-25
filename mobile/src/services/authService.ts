import { env } from '../config/env'

type RawLoginResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  usuario_id?: string
  rol?: string
  message?: string
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  userId: string
  role: string
}

export type SignedInUser = AuthSession & {
  email: string
}

// Principal entrada para el login: realiza POST /auth/login y normaliza el resultado.

export async function loginWithCredentials(email: string, password: string): Promise<AuthSession> {
  const url = env.auth.loginUrl
  console.log('🔐 Login URL:', url)
  console.log('📧 Email:', email)

  if (!url) {
    throw new Error('AUTH_URL_MISSING')
  }

  let response: Response
  try {
    console.log('📡 Enviando petición a:', url)
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    console.log('📬 Response status:', response.status)
  } catch (error) {
    console.error('❌ Network error:', error)
    throw new Error('NETWORK_ERROR')
  }

  const payload = (await response.json().catch(() => null)) as RawLoginResponse | null
  console.log('📦 Response payload:', JSON.stringify(payload, null, 2))

  if (!response.ok) {
    console.log('❌ Response not OK, status:', response.status)
    const message = (payload?.message ?? '').toLowerCase()
    if (response.status === 401 || message.includes('credenciales') || message.includes('invalid')) {
      throw new Error('INVALID_CREDENTIALS')
    }
    if (message.includes('desactivado') || message.includes('bloqueado')) {
      throw new Error('ACCOUNT_DISABLED')
    }
    throw new Error(payload?.message ?? 'AUTH_SERVICE_ERROR')
  }

  if (!payload || !payload.access_token || !payload.refresh_token || !payload.usuario_id) {
    throw new Error('AUTH_SERVICE_ERROR')
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresIn: payload.expires_in,
    userId: payload.usuario_id,
    role: payload.rol ?? 'cliente',
  }
}

// Encapsula el header de autorización para futuras llamadas protegidas.
export function buildAuthHeader(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` }
}
