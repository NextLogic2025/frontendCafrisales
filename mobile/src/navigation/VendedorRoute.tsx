import { VendedorView } from '../features/vendedor/VendedorView'
import type { RoleRoute } from './types'

export const VENDEDOR_ROUTE: RoleRoute = {
  key: 'vendedor',
  name: 'Vendedor',
  description:
    'Accede a catálogos dinámicos, cotizaciones y seguimiento inmediato para el equipo comercial.',
  component: <VendedorView />,
  endpointPath: '/vendedor',
}
