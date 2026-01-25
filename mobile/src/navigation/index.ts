import { BODEGUERO_ROUTE } from './BodegueroRoute'
import { CLIENTE_ROUTE } from './ClienteRoute'
import { SUPERVISOR_ROUTE } from './SupervisorRoute'
import { TRANSPORTISTA_ROUTE } from './TransportistaRoute'
import { VENDEDOR_ROUTE } from './VendedorRoute'
import type { RoleRoute } from './types'

export const ROLE_ROUTES: RoleRoute[] = [
  VENDEDOR_ROUTE,
  CLIENTE_ROUTE,
  BODEGUERO_ROUTE,
  SUPERVISOR_ROUTE,
  TRANSPORTISTA_ROUTE,
]

export { getRoleEndpoint } from './endpoints'
