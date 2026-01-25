import { BodegueroView } from '../features/bodeguero/BodegueroView'
import type { RoleRoute } from './types'

export const BODEGUERO_ROUTE: RoleRoute = {
  key: 'bodeguero',
  name: 'Bodeguero',
  description:
    'Inventario en tiempo real, rutas de almacén y alertas de picking para evitar errores logísticos.',
  component: <BodegueroView />,
  endpointPath: '/bodeguero',
}
