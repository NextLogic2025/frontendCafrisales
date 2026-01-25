import { SupervisorView } from '../features/supervisor/SupervisorView'
import type { RoleRoute } from './types'

export const SUPERVISOR_ROUTE: RoleRoute = {
  key: 'supervisor',
  name: 'Supervisor',
  description:
    'Panel ejecutivo con métricas clave, alertas operativas y reportes financieros compactos.',
  component: <SupervisorView />,
  endpointPath: '/supervisor',
}
