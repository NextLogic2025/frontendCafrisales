import { VendedorView } from '../features/vendedor/VendedorView'
import type { RoleRoute } from './types'

export const VENDEDOR_ROUTE: RoleRoute = {
  key: 'vendedor',
  name: 'Vendedor',
  description:
    'Catálogo comercial, cotizaciones y seguimiento inmediato del pipeline para los equipos de ventas.',
  component: <VendedorView />,
  endpointPath: '/vendedor',
}
