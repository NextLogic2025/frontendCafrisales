import { SupervisorView } from '../features/supervisor/SupervisorView'
import type { RoleRoute } from './types'

export const SUPERVISOR_ROUTE: RoleRoute = {
  key: 'supervisor',
  name: 'Supervisor',
  description:
    'Panel de métricas clave, alertas operativas y accesos rápidos a reportes financieros.',
  component: <SupervisorView />,
  endpointPath: '/supervisor',
}
