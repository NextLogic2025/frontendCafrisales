import { env } from '../../config/env'
import { ApiService } from './ApiService'
import { createService } from './createService'
import { logErrorForDebugging } from '../../utils/errorMessages'
import { getValidToken } from '../auth/authClient'

export type CatalogCategory = {
  id: string
  nombre: string
  slug: string
  descripcion?: string | null
  img_url?: string | null
  activo?: boolean
  orden?: number
}

export type CatalogCategoryPayload = {
  nombre: string
  slug?: string
  descripcion?: string
  img_url?: string
  activo?: boolean
  orden?: number
}

const CATALOG_BASE_URL = env.api.catalogUrl
const CATALOG_API_URL =
  CATALOG_BASE_URL.endsWith('/api/v1')
    ? CATALOG_BASE_URL
    : CATALOG_BASE_URL.endsWith('/api')
      ? `${CATALOG_BASE_URL}/v1`
      : `${CATALOG_BASE_URL}/api/v1`

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

  async uploadCategoryImage(
    id: string,
    file: { uri: string; name: string; type: string },
  ): Promise<CatalogCategory | null> {
    try {
      const token = await getValidToken()
      const formData = new FormData()
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any)

      const response = await fetch(`${CATALOG_API_URL}/categorias/${id}/imagen`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        logErrorForDebugging(new Error(`API ${response.status}`), 'CatalogCategoryService.uploadCategoryImage', {
          id,
          status: response.status,
          errorText,
        })
        return null
      }

      const data = await response.json().catch(() => null)
      return data as CatalogCategory
    } catch (error) {
      logErrorForDebugging(error, 'CatalogCategoryService.uploadCategoryImage', { id })
      return null
    }
  },
}

export const CatalogCategoryService = createService('CatalogCategoryService', rawService)
