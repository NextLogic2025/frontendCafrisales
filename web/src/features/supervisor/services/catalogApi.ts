export interface Category {
  id: number
  nombre: string
  descripcion: string | null
  imagen_url: string | null
  activo: boolean
  created_at: string
  deleted_at: string | null
}

export interface CreateCategoryDto {
  nombre: string
  descripcion?: string
  imagen_url?: string
  activo?: boolean
}

export async function getAllCategories(): Promise<Category[]> {
  return []
}

export async function getCategoryById(id: number): Promise<Category | null> {
  return {
    id,
    nombre: 'Categoria Mock',
    descripcion: null,
    imagen_url: null,
    activo: true,
    created_at: new Date().toISOString(),
    deleted_at: null
  }
}

export async function createCategory(data: CreateCategoryDto): Promise<Category> {
  return {
    id: Math.floor(Math.random() * 1000),
    nombre: data.nombre,
    descripcion: data.descripcion || null,
    imagen_url: data.imagen_url || null,
    activo: data.activo ?? true,
    created_at: new Date().toISOString(),
    deleted_at: null
  }
}

export async function updateCategory(id: number, data: Partial<CreateCategoryDto>): Promise<Category> {
  return getCategoryById(id) as Promise<Category>
}

export interface Canal {
  id: string | number
  nombre: string
  codigo: string
}

export async function obtenerCanales(): Promise<Canal[]> {
  try {
    const { env } = await import('../../../config/env')
    const { getValidToken } = await import('../../../services/auth/authClient')
    const token = await getValidToken()
    if (!token) throw new Error('No hay sesión activa')

    const base = env.api.usuarios
    const url = `${base}/api/canales`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    const data = await res.json().catch(() => [])
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error fetching canales:', error)
    return []
  }
}

export async function deleteCategory(id: number): Promise<void> {
  return Promise.resolve()
}
