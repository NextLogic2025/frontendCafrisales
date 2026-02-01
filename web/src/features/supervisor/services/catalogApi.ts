import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'

export interface Category {
  id: string | number
  nombre: string
  slug: string
  descripcion: string | null
  img_url: string | null
  activo: boolean
  created_at?: string
  deleted_at?: string | null
}

export interface CreateCategoryDto {
  nombre: string
  slug: string
  descripcion?: string
  img_url?: string
}

const CATALOG_BASE_URL = env.api.catalogo
const CATALOG_API_URL = CATALOG_BASE_URL.endsWith('/api') ? CATALOG_BASE_URL : `${CATALOG_BASE_URL}/api`

export async function getAllCategories(): Promise<Category[]> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/v1/categorias`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  return await res.json()
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/v1/categorias/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return await res.json()
}

export async function createCategory(data: CreateCategoryDto): Promise<Category> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/v1/categorias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al crear la categoría')
  }

  return await res.json()
}

export async function updateCategory(id: string, data: Partial<CreateCategoryDto>): Promise<Category> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/v1/categorias/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al actualizar la categoría')
  }

  return await res.json()
}

export async function deleteCategory(id: string): Promise<void> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/v1/categorias/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    throw new Error('Error al eliminar categoría')
  }
}

export async function getDeletedCategories(): Promise<Category[]> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/v1/categorias/eliminadas`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  return await res.json()
}

export async function restoreCategory(id: string | number): Promise<void> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/v1/categorias/${id}/restaurar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    throw new Error('Error al restaurar categoría')
  }
}

export interface Canal {
  id: string | number
  nombre: string
  codigo: string
}

export async function obtenerCanales(): Promise<Canal[]> {
  try {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const base = env.api.usuarios
    const url = `${base}/api/v1/canales`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    const data = await res.json().catch(() => [])
    return Array.isArray(data) ? data : []
  } catch (error) {
    return []
  }
}
