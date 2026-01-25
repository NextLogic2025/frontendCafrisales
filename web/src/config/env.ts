export const webEnv = {
  authApiUrl: import.meta.env.VITE_AUTH_API_URL ?? '',
  authLoginUrl: import.meta.env.VITE_AUTH_LOGIN_URL ?? '',
  authForgotUrl: import.meta.env.VITE_AUTH_FORGOT_PASSWORD_URL ?? '',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  usersApiUrl: import.meta.env.VITE_USERS_API_URL ?? '',
  catalogApiUrl: import.meta.env.VITE_CATALOG_API_URL ?? '',
  ordersApiUrl: import.meta.env.VITE_ORDERS_API_URL ?? '',
  warehouseApiUrl: import.meta.env.VITE_WAREHOUSE_API_URL ?? '',
  logisticsApiUrl: import.meta.env.VITE_LOGISTICS_API_URL ?? '',
  financeApiUrl: import.meta.env.VITE_FINANCE_API_URL ?? '',
  googleMapsKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
}
