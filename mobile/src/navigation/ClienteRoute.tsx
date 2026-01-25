import { ClienteView } from '../features/cliente/ClienteView'
import type { RoleRoute } from './types'

export const CLIENTE_ROUTE: RoleRoute = {
  key: 'cliente',
  name: 'Cliente',
  description:
    'Gestión del ciclo completo con pedidos, entregas y comunicaciones directas con soporte.',
  component: <ClienteView />,
  endpointPath: '/cliente',
}
