import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'

export type CatalogCategory = {
  id: string
  nombre: string
  slug: string
  descripcion?: string | null
}

export type CatalogCategoryPayload = {
  nombre: string
  slug?: string
  descripcion?: string
}

const CATALOG_BASE_URL = env.api.catalogUrl
const CATALOG_API_URL = CATALOG_BASE_URL.endsWith('/api') ? CATALOG_BASE_URL : `${CATALOG_BASE_URL}/api`

const rawService = {
  async getCategories(): Promise<CatalogCategory[]> {
    try {
      return await ApiService.get<CatalogCategory[]>(`${CATALOG_API_URL}/categorias`)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogCategoryService.getCategories')
      return []
    }
  },

  async getCategory(id: string): Promise<CatalogCategory | null> {
    try {
      return await ApiService.get<CatalogCategory>(`${CATALOG_API_URL}/categorias/${id}`)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogCategoryService.getCategory', { id })
      return null
    }
  },

  async createCategory(payload: CatalogCategoryPayload): Promise<CatalogCategory | null> {
    try {
      return await ApiService.post<CatalogCategory>(`${CATALOG_API_URL}/categorias`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogCategoryService.createCategory')
      return null
    }
  },

  async updateCategory(id: string, payload: Partial<CatalogCategoryPayload>): Promise<CatalogCategory | null> {
    try {
      return await ApiService.patch<CatalogCategory>(`${CATALOG_API_URL}/categorias/${id}`, payload)
    } catch (error) {
      logErrorForDebugging(error, 'CatalogCategoryService.updateCategory', { id })
      return null
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await ApiService.delete(`${CATALOG_API_URL}/categorias/${id}`)
      return true
    } catch (error) {
      logErrorForDebugging(error, 'CatalogCategoryService.deleteCategory', { id })
      return false
    }
  },
}

export const CatalogCategoryService = createService('CatalogCategoryService', rawService)
