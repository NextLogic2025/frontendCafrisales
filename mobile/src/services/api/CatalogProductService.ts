import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'

export type CatalogProductCategory = {
  id: string
  nombre: string
  slug: string
  descripcion?: string | null
  img_url?: string | null
}

export type CatalogProductSku = {
  id: string
  codigo_sku: string
  nombre: string
  peso_gramos: number
  precios?: {
    id: string
    precio: number
    moneda: string
    vigente_desde: string
    vigente_hasta?: string | null
  }[]
}

export type CatalogProduct = {
  id: string
  nombre: string
  slug: string
  descripcion?: string | null
  img_url?: string | null
  categoria?: CatalogProductCategory | null
  categoria_id?: string
  skus?: CatalogProductSku[]
}

export type CatalogProductPayload = {
  categoria_id: string
  nombre: string
  slug: string
  descripcion?: string
  img_url?: string
}

const CATALOG_BASE_URL = env.api.catalogUrl
const CATALOG_API_URL =
  CATALOG_BASE_URL.endsWith('/api/v1')
    ? CATALOG_BASE_URL
    : CATALOG_BASE_URL.endsWith('/api')
      ? `${CATALOG_BASE_URL}/v1`
      : `${CATALOG_BASE_URL}/api/v1`

const unwrapList = <T>(data: any): T[] => {
  if (!data) return []
  if (Array.isArray(data)) return data as T[]
  if (Array.isArray(data.data)) return data.data as T[]
  return []
}

const rawService = {
  async getProducts(): Promise<CatalogProduct[]> {
    try {
      const data = await ApiService.get<any>(`${CATALOG_API_URL}/products`)
      return unwrapList<CatalogProduct>(data)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogProductService.getProducts')
      return []
    }
  },

  async getProduct(id: string): Promise<CatalogProduct | null> {
    try {
      return await ApiService.get<CatalogProduct>(`${CATALOG_API_URL}/products/${id}`)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogProductService.getProduct', { id })
      return null
    }
  },

  async createProduct(payload: CatalogProductPayload): Promise<CatalogProduct | null> {
    try {
      return await ApiService.post<CatalogProduct>(`${CATALOG_API_URL}/products`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogProductService.createProduct')
      return null
    }
  },

  async updateProduct(id: string, payload: Partial<CatalogProductPayload>): Promise<CatalogProduct | null> {
    try {
      return await ApiService.patch<CatalogProduct>(`${CATALOG_API_URL}/products/${id}`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogProductService.updateProduct', { id })
      return null
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await ApiService.delete(`${CATALOG_API_URL}/products/${id}`)
      return true
    } catch (error) {
      logErrorForDebugging(error, 'CatalogProductService.deleteProduct', { id })
      return false
    }
  },
}

export const CatalogProductService = createService('CatalogProductService', rawService)
