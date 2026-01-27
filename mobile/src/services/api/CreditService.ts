import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'

export type ApproveCreditPayload = {
  pedido_id: string
  cliente_id: string
  monto_aprobado: number
  plazo_dias: number
  notas?: string
}

export type CreditResponse = {
  id: string
  pedido_id: string
  cliente_id: string
  monto_aprobado: number
  fecha_vencimiento?: string
  estado?: string
}

export type CreditListItem = {
  id: string
  pedido_id: string
  cliente_id: string
  monto_aprobado: number
  fecha_vencimiento?: string
  estado?: string
  saldo?: number
}

const CREDIT_BASE_URL = env.api.creditUrl
const CREDIT_API_URL = CREDIT_BASE_URL.endsWith('/api') ? CREDIT_BASE_URL : `${CREDIT_BASE_URL}/api`

const rawService = {
  async approveCredit(payload: ApproveCreditPayload): Promise<CreditResponse | null> {
    try {
      return await ApiService.post<CreditResponse>(`${CREDIT_API_URL}/creditos/aprobar`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'CreditService.approveCredit')
      return null
    }
  },

  async getCreditsBySeller(vendedorId: string, estados?: string[]): Promise<CreditListItem[]> {
    try {
      const estadoQuery = estados && estados.length > 0 ? `&estado=${encodeURIComponent(estados.join(','))}` : ''
      const url = `${CREDIT_API_URL}/creditos?vendedor_id=${encodeURIComponent(vendedorId)}${estadoQuery}`
      return await ApiService.get<CreditListItem[]>(url)
    } catch (error) {
      logErrorForDebugging(error, 'CreditService.getCreditsBySeller', { vendedorId })
      return []
    }
  },
}

export const CreditService = createService('CreditService', rawService)
