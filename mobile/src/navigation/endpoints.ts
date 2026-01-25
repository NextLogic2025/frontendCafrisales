import type { RoleRoute } from './types'
import { mobileEnv } from '../config/env'

export function getRoleEndpoint(route: RoleRoute) {
  if (!mobileEnv.apiBaseUrl) return route.endpointPath
  return `${mobileEnv.apiBaseUrl}${route.endpointPath}`
}
