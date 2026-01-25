import { env } from '../config/env'
import { buildAuthHeader } from './authService'

export type UserProfile = {
  nombres: string
  apellidos: string
  telefono?: string | null
  url_avatar?: string | null
}

const usersBase = env.api.usersUrl
const profilePath = '/api/usuarios/me/perfil'

async function handleJson<T>(res: Response): Promise<T> {
  const payload = (await res.json().catch(() => null)) as any
  if (!res.ok) {
    const message = payload?.message || `HTTP_${res.status}`
    throw new Error(message)
  }
  return payload as T
}

export async function fetchMyProfile(accessToken: string): Promise<UserProfile | null> {
  const res = await fetch(`${usersBase}${profilePath}`, {
    method: 'GET',
    headers: {
      ...buildAuthHeader(accessToken),
    },
  })

  if (res.status === 404) return null
  return handleJson<UserProfile>(res)
}

export async function updateMyProfile(
  accessToken: string,
  data: Partial<UserProfile>,
): Promise<UserProfile> {
  const res = await fetch(`${usersBase}${profilePath}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeader(accessToken),
    },
    body: JSON.stringify(data),
  })

  return handleJson<UserProfile>(res)
}
