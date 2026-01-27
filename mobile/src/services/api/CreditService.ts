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
  monto_aprobado: number | string
  fecha_vencimiento?: string
  estado?: string
}

export type CreditListItem = {
  id: string
  pedido_id: string
  cliente_id: string
  monto_aprobado: number | string
  fecha_vencimiento?: string
  estado?: string
  saldo?: number | string
}

export type CreditTotals = {
  total_pagado?: number | string
  saldo?: number | string
}

export type CreditPayment = {
  id: string
  monto_pago: number | string
  fecha_pago?: string
  referencia?: string | null
}

export type CreditDetailResponse = {
  credito: CreditResponse
  totales?: CreditTotals
  pagos?: CreditPayment[]
}

export type RegisterPaymentPayload = {
  monto_pago: number
  fecha_pago?: string
  referencia?: string
  notas?: string
  metodo_registro?: string
  moneda?: string
}

const CREDIT_BASE_URL = env.api.creditUrl
const CREDIT_API_URL = CREDIT_BASE_URL.endsWith('/api') ? CREDIT_BASE_URL : `${CREDIT_BASE_URL}/api`

const toNumber = (value: number | string | undefined | null) => {
  if (value === undefined || value === null) return 0
  if (typeof value === 'number') return value
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const normalizeCredit = (credit: CreditListItem): CreditListItem => ({
  ...credit,
  monto_aprobado: toNumber(credit.monto_aprobado),
  saldo: toNumber(credit.saldo),
})

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
      const data = await ApiService.get<CreditListItem[]>(url)
      return data.map(normalizeCredit)
    } catch (error) {
      logErrorForDebugging(error, 'CreditService.getCreditsBySeller', { vendedorId })
      return []
    }
  },

  async getCreditById(creditId: string): Promise<CreditDetailResponse | null> {
    try {
      const data = await ApiService.get<CreditDetailResponse>(`${CREDIT_API_URL}/creditos/${creditId}`)
      const credito = data.credito ? normalizeCredit(data.credito as CreditListItem) : data.credito
      const pagos = (data.pagos || []).map((p) => ({
        ...p,
        monto_pago: toNumber(p.monto_pago),
      }))
      const totales = data.totales
        ? {
            total_pagado: toNumber(data.totales.total_pagado),
            saldo: toNumber(data.totales.saldo),
          }
        : undefined
      return { ...data, credito, pagos, totales }
    } catch (error) {
      logErrorForDebugging(error, 'CreditService.getCreditById', { creditId })
      return null
    }
  },

  async registerPayment(creditId: string, payload: RegisterPaymentPayload): Promise<boolean> {
    try {
      await ApiService.post(`${CREDIT_API_URL}/creditos/${creditId}/pagos`, payload)
      return true
    } catch (error) {
      logErrorForDebugging(error, 'CreditService.registerPayment', { creditId })
      return false
    }
  },

  async getCreditsAll(estados?: string[]): Promise<CreditListItem[]> {
    try {
      const estadoQuery = estados && estados.length > 0 ? `?estado=${encodeURIComponent(estados.join(','))}` : ''
      const url = `${CREDIT_API_URL}/creditos${estadoQuery}`
      const data = await ApiService.get<CreditListItem[]>(url)
      return data.map(normalizeCredit)
    } catch (error) {
      logErrorForDebugging(error, 'CreditService.getCreditsAll')
      return []
    }
  },
}

export const CreditService = createService('CreditService', rawService)
