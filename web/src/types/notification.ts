export interface AppNotification {
  id?: string
  type: string
  title: string
  message: string
  data?: any
  timestamp?: number
  read?: boolean
  readAt?: number | null
  prioridad?: number | null
  requiereAccion?: boolean
  urlAccion?: string | null
}
