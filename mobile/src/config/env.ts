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

// Microservicios usados por la app (auth, users, catalog, zones)
const envSchema = z.object({
  EXPO_PUBLIC_AUTH_API_URL: z.string().url().optional(),
  EXPO_PUBLIC_AUTH_LOGIN_URL: z.string().url(),
  EXPO_PUBLIC_AUTH_FORGOT_PASSWORD_URL: z.string().url().optional(),
  EXPO_PUBLIC_API_BASE_URL: z.string().url(),
  EXPO_PUBLIC_USERS_API_URL: z.string().url(),
  EXPO_PUBLIC_CATALOG_API_URL: z.string().url(),
  EXPO_PUBLIC_ORDER_API_URL: z.string().url(),
  EXPO_PUBLIC_CREDIT_API_URL: z.string().url(),
  EXPO_PUBLIC_ZONE_API_URL: z.string().url(),
  EXPO_PUBLIC_ROUTE_API_URL: z.string().url().optional(),
  EXPO_PUBLIC_DELIVERY_API_URL: z.string().url().optional(),
  EXPO_PUBLIC_NOTIFICATIONS_API_URL: z.string().url().optional(),
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  EXPO_PUBLIC_ORDERS_API_URL: z.string().url().optional(),
  EXPO_PUBLIC_WAREHOUSE_API_URL: z.string().url().optional(),
  EXPO_PUBLIC_LOGISTICS_API_URL: z.string().url().optional(),
  EXPO_PUBLIC_FINANCE_API_URL: z.string().url().optional(),
})

const parsedEnv = envSchema.safeParse({
  EXPO_PUBLIC_AUTH_API_URL: getRawEnv('EXPO_PUBLIC_AUTH_API_URL'),
  EXPO_PUBLIC_AUTH_LOGIN_URL: getRawEnv('EXPO_PUBLIC_AUTH_LOGIN_URL'),
  EXPO_PUBLIC_AUTH_FORGOT_PASSWORD_URL: getRawEnv('EXPO_PUBLIC_AUTH_FORGOT_PASSWORD_URL'),
  EXPO_PUBLIC_API_BASE_URL: getRawEnv('EXPO_PUBLIC_API_BASE_URL'),
  EXPO_PUBLIC_USERS_API_URL: getRawEnv('EXPO_PUBLIC_USERS_API_URL'),
  EXPO_PUBLIC_CATALOG_API_URL: getRawEnv('EXPO_PUBLIC_CATALOG_API_URL'),
  EXPO_PUBLIC_ORDER_API_URL: getRawEnv('EXPO_PUBLIC_ORDER_API_URL'),
  EXPO_PUBLIC_CREDIT_API_URL: getRawEnv('EXPO_PUBLIC_CREDIT_API_URL'),
  EXPO_PUBLIC_ZONE_API_URL: getRawEnv('EXPO_PUBLIC_ZONE_API_URL'),
  EXPO_PUBLIC_ROUTE_API_URL: getRawEnv('EXPO_PUBLIC_ROUTE_API_URL'),
  EXPO_PUBLIC_DELIVERY_API_URL: getRawEnv('EXPO_PUBLIC_DELIVERY_API_URL'),
  EXPO_PUBLIC_NOTIFICATIONS_API_URL: getRawEnv('EXPO_PUBLIC_NOTIFICATIONS_API_URL'),
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: getRawEnv('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY'),
  EXPO_PUBLIC_ORDERS_API_URL: getRawEnv('EXPO_PUBLIC_ORDERS_API_URL'),
  EXPO_PUBLIC_WAREHOUSE_API_URL: getRawEnv('EXPO_PUBLIC_WAREHOUSE_API_URL'),
  EXPO_PUBLIC_LOGISTICS_API_URL: getRawEnv('EXPO_PUBLIC_LOGISTICS_API_URL'),
  EXPO_PUBLIC_FINANCE_API_URL: getRawEnv('EXPO_PUBLIC_FINANCE_API_URL'),
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
  EXPO_PUBLIC_ORDER_API_URL,
  EXPO_PUBLIC_CREDIT_API_URL,
  EXPO_PUBLIC_ZONE_API_URL,
  EXPO_PUBLIC_ROUTE_API_URL,
  EXPO_PUBLIC_DELIVERY_API_URL,
  EXPO_PUBLIC_NOTIFICATIONS_API_URL,
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  EXPO_PUBLIC_ORDERS_API_URL,
  EXPO_PUBLIC_WAREHOUSE_API_URL,
  EXPO_PUBLIC_LOGISTICS_API_URL,
  EXPO_PUBLIC_FINANCE_API_URL,
} = parsedEnv.data

export const env = {
  auth: {
    baseUrl: normalizeBaseUrl(EXPO_PUBLIC_AUTH_API_URL ?? tryExtractOrigin(EXPO_PUBLIC_AUTH_LOGIN_URL)),
    loginUrl: EXPO_PUBLIC_AUTH_LOGIN_URL,
    forgotPasswordUrl: EXPO_PUBLIC_AUTH_FORGOT_PASSWORD_URL ?? '',
  },
  api: {
    baseUrl: normalizeBaseUrl(EXPO_PUBLIC_API_BASE_URL),
    usersUrl: normalizeBaseUrl(EXPO_PUBLIC_USERS_API_URL),
    catalogUrl: normalizeBaseUrl(EXPO_PUBLIC_CATALOG_API_URL),
    orderUrl: normalizeBaseUrl(EXPO_PUBLIC_ORDER_API_URL ?? EXPO_PUBLIC_ORDERS_API_URL ?? EXPO_PUBLIC_API_BASE_URL),
    creditUrl: normalizeBaseUrl(EXPO_PUBLIC_CREDIT_API_URL ?? EXPO_PUBLIC_FINANCE_API_URL ?? EXPO_PUBLIC_API_BASE_URL),
    zoneUrl: normalizeBaseUrl(EXPO_PUBLIC_ZONE_API_URL),
    routeUrl: normalizeBaseUrl(
      EXPO_PUBLIC_ROUTE_API_URL ?? EXPO_PUBLIC_LOGISTICS_API_URL ?? EXPO_PUBLIC_API_BASE_URL
    ),
    deliveryUrl: normalizeBaseUrl(
      EXPO_PUBLIC_DELIVERY_API_URL ?? EXPO_PUBLIC_WAREHOUSE_API_URL ?? EXPO_PUBLIC_API_BASE_URL
    ),
    notificationsUrl: normalizeBaseUrl(EXPO_PUBLIC_NOTIFICATIONS_API_URL ?? EXPO_PUBLIC_API_BASE_URL),
  },
  googleMapsKey: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
} as const
