import { BodegueroView } from '../features/bodeguero/BodegueroView'
import type { RoleRoute } from './types'

export const BODEGUERO_ROUTE: RoleRoute = {
  key: 'bodeguero',
  name: 'Bodeguero',
  description:
    'Inventarios, ubicaciones y alertas de picking reflejadas en tiempo real para el equipo de bodega.',
  component: <BodegueroView />,
  endpointPath: '/bodeguero',
}
