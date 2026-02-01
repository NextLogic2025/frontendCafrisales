import { env } from '../../../config/env'
import { getValidToken } from '../../../services/auth/authClient'
import { useEntityCrud } from '../../../hooks/useEntityCrud'

export interface CatalogSkuProduct {
    id: string
    nombre: string
    slug: string
}

export interface CatalogSku {
    id: string
    codigo_sku: string
    nombre: string
    peso_gramos: number
    producto_id?: string
    producto?: CatalogSkuProduct | null
    activo: boolean
    created_at?: string
}

export interface CreateSkuDto {
    producto_id: string
    codigo_sku: string
    nombre: string
    peso_gramos: number
}

const CATALOG_BASE_URL = env.api.catalogo
const CATALOG_API_URL = CATALOG_BASE_URL.endsWith('/api') ? CATALOG_BASE_URL : `${CATALOG_BASE_URL}/api`

export async function getAllSkus(): Promise<CatalogSku[]> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${CATALOG_API_URL}/v1/skus`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    return await res.json()
}

export async function createSku(data: CreateSkuDto): Promise<CatalogSku> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${CATALOG_API_URL}/v1/skus`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al crear el SKU')
    }

    return await res.json()
}

export async function updateSku(id: string | number, data: Partial<CreateSkuDto>): Promise<CatalogSku> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${CATALOG_API_URL}/v1/skus/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    })

    if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.message || 'Error al actualizar el SKU')
    }

    return await res.json()
}

export async function deleteSku(id: string | number): Promise<void> {
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const res = await fetch(`${CATALOG_API_URL}/v1/skus/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
        throw new Error('Error al eliminar SKU')
    }
}

export function useSkuCrud() {
    const crud = useEntityCrud<CatalogSku, CreateSkuDto, Partial<CreateSkuDto>>({
        load: getAllSkus,
        create: createSku,
        update: updateSku,
        delete: deleteSku,
    })

    return crud
}
