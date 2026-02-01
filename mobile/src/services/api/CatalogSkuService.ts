import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'

export type CatalogSkuProduct = {
  id: string
  nombre: string
  slug: string
  categoria?: { id: string; nombre: string; slug: string } | null
}

export type CatalogSku = {
  id: string
  codigo_sku: string
  nombre: string
  peso_gramos: number
  precios?: CatalogSkuPrice[]
  producto?: CatalogSkuProduct | null
  producto_id?: string
}

export type CatalogSkuPayload = {
  producto_id: string
  codigo_sku: string
  nombre: string
  peso_gramos: number
}

export type CatalogSkuPrice = {
  id: string
  precio: number
  moneda: string
  vigente_desde: string
  vigente_hasta?: string | null
}

const CATALOG_BASE_URL = env.api.catalogUrl
const CATALOG_API_URL =
  CATALOG_BASE_URL.endsWith('/api/v1')
    ? CATALOG_BASE_URL
    : CATALOG_BASE_URL.endsWith('/api')
      ? `${CATALOG_BASE_URL}/v1`
      : `${CATALOG_BASE_URL}/api/v1`

const rawService = {
  async getSkus(): Promise<CatalogSku[]> {
    try {
      return await ApiService.get<CatalogSku[]>(`${CATALOG_API_URL}/skus`)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogSkuService.getSkus')
      return []
    }
  },

  async getSku(id: string): Promise<CatalogSku | null> {
    try {
      return await ApiService.get<CatalogSku>(`${CATALOG_API_URL}/skus/${id}`)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogSkuService.getSku', { id })
      return null
    }
  },

  async createSku(payload: CatalogSkuPayload): Promise<CatalogSku | null> {
    try {
      return await ApiService.post<CatalogSku>(`${CATALOG_API_URL}/skus`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogSkuService.createSku')
      return null
    }
  },

  async updateSku(id: string, payload: Partial<CatalogSkuPayload>): Promise<CatalogSku | null> {
    try {
      return await ApiService.patch<CatalogSku>(`${CATALOG_API_URL}/skus/${id}`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogSkuService.updateSku', { id })
      return null
    }
  },

  async deleteSku(id: string): Promise<boolean> {
    try {
      await ApiService.delete(`${CATALOG_API_URL}/skus/${id}`)
      return true
    } catch (error) {
      logErrorForDebugging(error, 'CatalogSkuService.deleteSku', { id })
      return false
    }
  },
}

export const CatalogSkuService = createService('CatalogSkuService', rawService)
