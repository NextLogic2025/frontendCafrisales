function readEnv(key: string) {
  // Intentamos leer la variable específica, si no existe, usamos la GENÉRICA del Gateway
  return String((import.meta.env as Record<string, unknown>)[key] || (import.meta.env as Record<string, unknown>)['VITE_API_URL'] || '').trim()
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, '')
}

// Leemos la URL única del Gateway que inyectamos en Cloud Build
const GATEWAY_URL = readEnv('VITE_API_URL');

export const env = {
  api: {
    // Todos los microservicios apuntan al mismo Gateway
    auth: GATEWAY_URL,
    usuarios: GATEWAY_URL,
    catalogo: GATEWAY_URL,
    orders: GATEWAY_URL,
    creditos: GATEWAY_URL,
    warehouse: GATEWAY_URL,
    delivery: GATEWAY_URL,
    transportista: GATEWAY_URL,
    routes: GATEWAY_URL,
    zonas: GATEWAY_URL,
    notifications: GATEWAY_URL,
  },
  googleMaps: {
    apiKey: readEnv('VITE_GOOGLE_MAPS_API_KEY'),
  },
} as const