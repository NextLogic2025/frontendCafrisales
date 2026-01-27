import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'

export interface CatalogSkuPrice {
  id: string
  sku_id: string
  precio: number
  moneda: string
  vigente_desde: string
  vigente_hasta?: string | null
}

export interface CatalogPriceCreatePayload {
  precio: number
  moneda?: string
}

export interface CatalogPriceUpdatePayload {
  nuevo_precio: number
  motivo?: string
}

const CATALOG_BASE_URL = env.api.catalogo
const CATALOG_API_URL = CATALOG_BASE_URL.endsWith('/api') ? CATALOG_BASE_URL : `${CATALOG_BASE_URL}/api`

export async function getCurrentPrice(skuId: string): Promise<CatalogSkuPrice | null> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/skus/${skuId}/precio-vigente`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return await res.json()
}

export async function createPrice(skuId: string, payload: CatalogPriceCreatePayload): Promise<CatalogSkuPrice | null> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/skus/${skuId}/precio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al registrar el precio')
  }

  return await res.json()
}

export async function updatePrice(skuId: string, payload: CatalogPriceUpdatePayload): Promise<CatalogSkuPrice | null> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/skus/${skuId}/precio`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.message || 'Error al actualizar el precio')
  }

  return await res.json()
}

export async function getPriceHistory(skuId: string): Promise<CatalogSkuPrice[]> {
  const token = await getValidToken()
  if (!token) throw new Error('No hay sesión activa')

  const res = await fetch(`${CATALOG_API_URL}/skus/${skuId}/precios-historial`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return []
  return await res.json()
}
