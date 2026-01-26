import { z } from 'zod'

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, '')
}

function tryExtractOrigin(url: string) {
  try {
    const parsed = new URL(url)
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return ''
  }
}

function getRawEnv(key: string): string | undefined {
  const value = (process.env as Record<string, string | undefined>)[key]
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

// Solo 2 microservicios: Auth y Users
const envSchema = z.object({
  EXPO_PUBLIC_AUTH_API_URL: z.string().url().optional(),
  EXPO_PUBLIC_AUTH_LOGIN_URL: z.string().url(),
  EXPO_PUBLIC_AUTH_FORGOT_PASSWORD_URL: z.string().url().optional(),
  EXPO_PUBLIC_API_BASE_URL: z.string().url(),
  EXPO_PUBLIC_USERS_API_URL: z.string().url(),
  EXPO_PUBLIC_CATALOG_API_URL: z.string().url(),
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
})

const parsedEnv = envSchema.safeParse({
  EXPO_PUBLIC_AUTH_API_URL: getRawEnv('EXPO_PUBLIC_AUTH_API_URL'),
  EXPO_PUBLIC_AUTH_LOGIN_URL: getRawEnv('EXPO_PUBLIC_AUTH_LOGIN_URL'),
  EXPO_PUBLIC_AUTH_FORGOT_PASSWORD_URL: getRawEnv('EXPO_PUBLIC_AUTH_FORGOT_PASSWORD_URL'),
  EXPO_PUBLIC_API_BASE_URL: getRawEnv('EXPO_PUBLIC_API_BASE_URL'),
  EXPO_PUBLIC_USERS_API_URL: getRawEnv('EXPO_PUBLIC_USERS_API_URL'),
  EXPO_PUBLIC_CATALOG_API_URL: getRawEnv('EXPO_PUBLIC_CATALOG_API_URL'),
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: getRawEnv('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY'),
})

if (!parsedEnv.success) {
  console.error(
    'Variables de entorno inválidas. Verifica los EXPO_PUBLIC_* en tu .env o entorno de Expo.',
    parsedEnv.error.format(),
  )
  throw new Error('Configuración del entorno inválida')
}

const {
  EXPO_PUBLIC_AUTH_API_URL,
  EXPO_PUBLIC_AUTH_LOGIN_URL,
  EXPO_PUBLIC_AUTH_FORGOT_PASSWORD_URL,
  EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_USERS_API_URL,
  EXPO_PUBLIC_CATALOG_API_URL,
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
} = parsedEnv.data

export const env = {
  auth: {
    baseUrl: normalizeBaseUrl(EXPO_PUBLIC_AUTH_API_URL ?? tryExtractOrigin(EXPO_PUBLIC_AUTH_LOGIN_URL)),
    loginUrl: EXPO_PUBLIC_AUTH_LOGIN_URL,
    forgotPasswordUrl: EXPO_PUBLIC_AUTH_FORGOT_PASSWORD_URL ?? '',
  },
  api: {
    baseUrl: normalizeBaseUrl(EXPO_PUBLIC_API_BASE_URL),
    catalogUrl: normalizeBaseUrl(EXPO_PUBLIC_API_BASE_URL),
    usersUrl: normalizeBaseUrl(EXPO_PUBLIC_USERS_API_URL),
  },
  googleMapsKey: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
} as const
