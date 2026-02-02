// frontendCafrisales/web/src/config/env.ts
function readEnv(key: string) {
  return String((import.meta.env as Record<string, unknown>)[key] ?? '').trim()
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, '')
}

// 🔥 AQUÍ ESTÁ EL CAMBIO: Ponemos la URL "a fuego" para asegurar que funcione.
// Esta es la URL de tu API Gateway que vimos en la consola.
const GATEWAY_URL = "https://cafrisales-gateway-gw-4dxrikij.ue.gateway.dev";

export const env = {
  api: {
    // Todos los servicios apuntan al Gateway
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
    // La API Key de Maps sí déjala como variable si quieres, o pégala aquí también si falla
    apiKey: readEnv('VITE_GOOGLE_MAPS_API_KEY'),
  },
} as const