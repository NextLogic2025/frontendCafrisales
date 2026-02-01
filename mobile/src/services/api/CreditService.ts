import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'
import { isApiError } from './ApiError'

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
const CREDIT_API_URL =
  CREDIT_BASE_URL.endsWith('/api/v1')
    ? CREDIT_BASE_URL
    : CREDIT_BASE_URL.endsWith('/api')
      ? `${CREDIT_BASE_URL}/v1`
      : `${CREDIT_BASE_URL}/api/v1`

const unwrapList = <T>(data: any): T[] => {
  if (!data) return []
  if (Array.isArray(data)) return data as T[]
  if (Array.isArray(data.data)) return data.data as T[]
  return []
}

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
      return await ApiService.post<CreditResponse>(`${CREDIT_API_URL}/credits/approve`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'CreditService.approveCredit')
      return null
    }
  },

  async getCreditsBySeller(vendedorId: string, estados?: string[]): Promise<CreditListItem[]> {
    try {
      const status = estados && estados.length > 0 ? estados[0] : undefined
      const statusQuery = status ? `&status=${encodeURIComponent(status)}` : ''
      const url = `${CREDIT_API_URL}/credits?sellerId=${encodeURIComponent(vendedorId)}${statusQuery}`
      const data = await ApiService.get<any>(url, { silent: true })
      return unwrapList<CreditListItem>(data).map(normalizeCredit)
    } catch (error) {
      if (isApiError(error) && error.status === 400) {
        try {
          const fallbackUrl = `${CREDIT_API_URL}/credits?sellerId=${encodeURIComponent(vendedorId)}`
          const data = await ApiService.get<any>(fallbackUrl, { silent: true })
          return unwrapList<CreditListItem>(data).map(normalizeCredit)
        } catch { }
      }
      logErrorForDebugging(error, 'CreditService.getCreditsBySeller', { vendedorId })
      return []
    }
  },

  async getCreditsByClient(clienteId: string, estados?: string[]): Promise<CreditListItem[]> {
    try {
      const status = estados && estados.length > 0 ? estados[0] : undefined
      const statusQuery = status ? `?status=${encodeURIComponent(status)}` : ''
      const url = `${CREDIT_API_URL}/credits/me${statusQuery}`
      const data = await ApiService.get<any>(url, { silent: true })
      return unwrapList<CreditListItem>(data).map(normalizeCredit)
    } catch (error) {
      if (isApiError(error) && error.status === 400) {
        try {
          const fallbackUrl = `${CREDIT_API_URL}/credits/me`
          const data = await ApiService.get<any>(fallbackUrl, { silent: true })
          return unwrapList<CreditListItem>(data).map(normalizeCredit)
        } catch { }
      }
      logErrorForDebugging(error, 'CreditService.getCreditsByClient', { clienteId })
      return []
    }
  },

  async getCreditById(creditId: string): Promise<CreditDetailResponse | null> {
    try {
      const data = await ApiService.get<CreditDetailResponse>(`${CREDIT_API_URL}/credits/${creditId}`)
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

  async getCreditByOrder(pedidoId: string): Promise<CreditDetailResponse | null> {
    try {
      const data = await ApiService.get<CreditDetailResponse>(
        `${CREDIT_API_URL}/credits?orderId=${encodeURIComponent(pedidoId)}`,
        { silent: true },
      )
      const list = unwrapList<CreditListItem>(data)
      if (!list.length) return null
      const creditId = list[0].id
      return await rawService.getCreditById(creditId)
    } catch (error: any) {
      if (error?.name === 'ApiError' && error?.status === 404) {
        return null
      }
      logErrorForDebugging(error, 'CreditService.getCreditByOrder', { pedidoId })
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

  async rejectCredit(creditId: string, motivo?: string): Promise<boolean> {
    try {
      await ApiService.put(`${CREDIT_API_URL}/credits/${creditId}/reject`, {
        motivo: motivo || 'Credito rechazado',
      })
      return true
    } catch (error) {
      logErrorForDebugging(error, 'CreditService.rejectCredit', { creditId })
      return false
    }
  },

  async getCreditsAll(estados?: string[]): Promise<CreditListItem[]> {
    try {
      const status = estados && estados.length > 0 ? estados[0] : undefined
      const statusQuery = status ? `?status=${encodeURIComponent(status)}` : ''
      const url = `${CREDIT_API_URL}/credits${statusQuery}`
      const data = await ApiService.get<any>(url, { silent: true })
      return unwrapList<CreditListItem>(data).map(normalizeCredit)
    } catch (error) {
      if (isApiError(error) && error.status === 400) {
        try {
          const fallbackUrl = `${CREDIT_API_URL}/credits`
          const data = await ApiService.get<any>(fallbackUrl, { silent: true })
          return unwrapList<CreditListItem>(data).map(normalizeCredit)
        } catch { }
      }
      logErrorForDebugging(error, 'CreditService.getCreditsAll')
      return []
    }
  },
}

export const CreditService = createService('CreditService', rawService)
