import { TransportistaView } from '../features/transportista/TransportistaView'
import type { RoleRoute } from './types'

export const TRANSPORTISTA_ROUTE: RoleRoute = {
  key: 'transportista',
  name: 'Transportista',
  description: 'Rutas inteligentes, estados de carga y notificaciones automáticas para entregas.',
  component: <TransportistaView />,
  endpointPath: '/transportista',
}
