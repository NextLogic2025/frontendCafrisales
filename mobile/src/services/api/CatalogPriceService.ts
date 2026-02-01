import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'

export type CatalogSkuPrice = {
  id: string
  sku_id: string
  precio: number
  moneda: string
  vigente_desde: string
  vigente_hasta?: string | null
}

export type CatalogPriceCreatePayload = {
  precio: number
  moneda?: string
}

export type CatalogPriceUpdatePayload = {
  nuevo_precio: number
  motivo?: string
}

const CATALOG_BASE_URL = env.api.catalogUrl
const CATALOG_API_URL =
  CATALOG_BASE_URL.endsWith('/api/v1')
    ? CATALOG_BASE_URL
    : CATALOG_BASE_URL.endsWith('/api')
      ? `${CATALOG_BASE_URL}/v1`
      : `${CATALOG_BASE_URL}/api/v1`

const rawService = {
  async getCurrentPrice(skuId: string): Promise<CatalogSkuPrice | null> {
    try {
      return await ApiService.get<CatalogSkuPrice>(`${CATALOG_API_URL}/skus/${skuId}/precio-vigente`)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogPriceService.getCurrentPrice', { skuId })
      return null
    }
  },

  async getPriceHistory(skuId: string): Promise<CatalogSkuPrice[]> {
    try {
      return await ApiService.get<CatalogSkuPrice[]>(`${CATALOG_API_URL}/skus/${skuId}/precios-historial`)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogPriceService.getPriceHistory', { skuId })
      return []
    }
  },

  async createPrice(skuId: string, payload: CatalogPriceCreatePayload): Promise<CatalogSkuPrice | null> {
    try {
      return await ApiService.post<CatalogSkuPrice>(`${CATALOG_API_URL}/skus/${skuId}/precio`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogPriceService.createPrice', { skuId })
      return null
    }
  },

  async updatePrice(skuId: string, payload: CatalogPriceUpdatePayload): Promise<CatalogSkuPrice | null> {
    try {
      return await ApiService.put<CatalogSkuPrice>(`${CATALOG_API_URL}/skus/${skuId}/precio`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogPriceService.updatePrice', { skuId })
      return null
    }
  },
}

export const CatalogPriceService = createService('CatalogPriceService', rawService)
