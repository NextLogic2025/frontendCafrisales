import type { ReactNode } from 'react'

export type RoleRoute = {
  key: 'vendedor' | 'cliente' | 'bodeguero' | 'supervisor' | 'transportista'
  name: string
  description: string
  component: ReactNode
  endpointPath: string
}
