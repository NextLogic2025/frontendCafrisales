import { ClienteView } from '../features/cliente/ClienteView'
import type { RoleRoute } from './types'

export const CLIENTE_ROUTE: RoleRoute = {
  key: 'cliente',
  name: 'Cliente',
  description:
    'Historial de pedidos, envíos activos y comunicación directa con soporte desde una sola tarjeta.',
  component: <ClienteView />,
  endpointPath: '/cliente',
}
