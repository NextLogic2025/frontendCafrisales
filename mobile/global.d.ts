import 'nativewind/types'

declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_AUTH_API_URL?: string
    EXPO_PUBLIC_AUTH_LOGIN_URL?: string
    EXPO_PUBLIC_AUTH_FORGOT_PASSWORD_URL?: string
    EXPO_PUBLIC_API_BASE_URL?: string
    EXPO_PUBLIC_USERS_API_URL?: string
    EXPO_PUBLIC_CATALOG_API_URL?: string
    EXPO_PUBLIC_ORDERS_API_URL?: string
    EXPO_PUBLIC_WAREHOUSE_API_URL?: string
    EXPO_PUBLIC_LOGISTICS_API_URL?: string
    EXPO_PUBLIC_FINANCE_API_URL?: string
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?: string
  }
}
