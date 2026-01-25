export const mobileEnv = {
  authLoginUrl: process.env.EXPO_PUBLIC_AUTH_LOGIN_URL ?? '',
  authAvatarUrl: process.env.EXPO_PUBLIC_AUTH_API_URL ?? '',
  authForgotUrl: process.env.EXPO_PUBLIC_AUTH_FORGOT_PASSWORD_URL ?? '',
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  usersApiUrl: process.env.EXPO_PUBLIC_USERS_API_URL ?? '',
  catalogApiUrl: process.env.EXPO_PUBLIC_CATALOG_API_URL ?? '',
  ordersApiUrl: process.env.EXPO_PUBLIC_ORDERS_API_URL ?? '',
  warehouseApiUrl: process.env.EXPO_PUBLIC_WAREHOUSE_API_URL ?? '',
  logisticsApiUrl: process.env.EXPO_PUBLIC_LOGISTICS_API_URL ?? '',
  financeApiUrl: process.env.EXPO_PUBLIC_FINANCE_API_URL ?? '',
  googleMapsKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
}
