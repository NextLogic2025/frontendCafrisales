import { webEnv } from '../config/env'
import type { RoleRoute } from './types'
import { BODEGUERO_ROUTE } from './Bodeguero'
import { CLIENTE_ROUTE } from './Cliente'
import { SUPERVISOR_ROUTE } from './Supervisor'
import { TRANSPORTISTA_ROUTE } from './Transportista'
import { VENDEDOR_ROUTE } from './Vendedor'

const baseApi = webEnv.apiBaseUrl

export const ROLE_ROUTES: RoleRoute[] = [
  VENDEDOR_ROUTE,
  CLIENTE_ROUTE,
  BODEGUERO_ROUTE,
  SUPERVISOR_ROUTE,
  TRANSPORTISTA_ROUTE,
]

export function getRoleEndpoint(route: RoleRoute) {
  if (!baseApi) return route.endpointPath
  return `${baseApi}${route.endpointPath}`
}
