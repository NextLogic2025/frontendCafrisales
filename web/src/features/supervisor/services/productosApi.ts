import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'
import { useEntityCrud } from '../../../hooks/useEntityCrud'

export interface CatalogProductCategory {
  id: string
  nombre: string
  slug: string
  descripcion?: string | null
  img_url?: string | null
}

export interface CatalogProductSku {
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

export interface Product {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  img_url: string | null
  categoria_id?: string
  categoria?: CatalogProductCategory | null
  skus?: CatalogProductSku[]
  activo: boolean
  created_at?: string
  deleted_at?: string | null
}

export interface CreateProductDto {
  categoria_id: string
  nombre: string
  slug: string
  descripcion?: string
  img_url?: string
}

const CATALOG_BASE_URL = env.api.catalogo
const CATALOG_API_URL = CATALOG_BASE_URL.endsWith('/api') ? CATALOG_BASE_URL : `${CATALOG_BASE_URL}/api`

export async function getAllProducts(): Promise<Product[]> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/v1/products`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}` },
  })
  if (!res.ok) return []
  const response = await res.json()
  // Backend returns paginated response { data, meta }
  return response.data || response
}

export async function getProductById(id: string): Promise<Product | null> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/v1/products/${id}`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}` },
  })
  if (!res.ok) return null
  return await res.json()
}

export async function createProduct(data: CreateProductDto): Promise<Product> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/v1/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al crear el producto')
  }

  return await res.json()
}

export async function updateProduct(id: string | number, data: Partial<CreateProductDto>): Promise<Product> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/v1/products/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al actualizar el producto')
  }

  return await res.json()
}

export async function deleteProduct(id: string | number): Promise<void> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/v1/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}` },
  })

  if (!res.ok) {
    throw new Error('Error al eliminar producto')
  }
}

export async function getDeletedProducts(): Promise<Product[]> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/v1/products/eliminados`, {
    headers: { Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}` },
  })
  if (!res.ok) return []
  return await res.json()
}

export async function restoreProduct(id: string | number): Promise<void> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/v1/products/${id}/restaurar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'X-Authorization': `Bearer ${token}` },
  })

  if (!res.ok) {
    throw new Error('Error al restaurar producto')
  }
}

export function useProductCrud() {
  const crud = useEntityCrud<Product, CreateProductDto, Partial<CreateProductDto>>({
    load: getAllProducts,
    create: createProduct,
    update: (id: string | number, data: Partial<CreateProductDto>) => updateProduct(id, data),
    delete: (id: string | number) => deleteProduct(id),
  })

  return {
    ...crud,
    getDeleted: getDeletedProducts,
    restore: restoreProduct,
  }
}
