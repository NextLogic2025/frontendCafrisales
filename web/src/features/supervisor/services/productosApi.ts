export interface Product {
  id: string
  codigo_sku: string
  nombre: string
  descripcion: string | null
  categoria_id?: number | null
  categoria?: {
    id: number
    nombre: string
  } | null
  peso_unitario_kg: string
  volumen_m3: string | null
  requiere_frio: boolean
  unidad_medida: string
  imagen_url: string | null
  activo: boolean
  created_at: string
  deleted_at: string | null
}

export interface CreateProductDto {
  codigo_sku: string
  nombre: string
  descripcion?: string
  categoria_id?: number | null
  peso_unitario_kg: number
  volumen_m3?: number | null
  requiere_frio?: boolean
  unidad_medida?: string
  imagen_url?: string
  imagenUrl?: string
  activo?: boolean
}

export async function getAllProducts(): Promise<Product[]> {
  return []
}

export async function getProductById(id: string): Promise<Product | null> {
  return {
    id,
    codigo_sku: 'MOCK-001',
    nombre: 'Producto Mock',
    descripcion: 'Descripcion Mock',
    peso_unitario_kg: '1.0',
    volumen_m3: '0.1',
    requiere_frio: false,
    unidad_medida: 'UN',
    imagen_url: null,
    activo: true,
    created_at: new Date().toISOString(),
    deleted_at: null
  }
}

export async function createProduct(data: CreateProductDto): Promise<Product> {
  return {
    id: 'mock-id',
    codigo_sku: data.codigo_sku,
    nombre: data.nombre,
    descripcion: data.descripcion || null,
    peso_unitario_kg: String(data.peso_unitario_kg),
    volumen_m3: String(data.volumen_m3 || 0),
    requiere_frio: data.requiere_frio || false,
    unidad_medida: data.unidad_medida || 'UN',
    imagen_url: data.imagen_url || null,
    activo: true,
    created_at: new Date().toISOString(),
    deleted_at: null
  }
}

export async function updateProduct(id: string, data: Partial<CreateProductDto>): Promise<Product> {
  // Mock update
  return {
    id,
    codigo_sku: data.codigo_sku || 'MOCK-001',
    nombre: data.nombre || 'Producto Mock',
    descripcion: data.descripcion || null,
    peso_unitario_kg: String(data.peso_unitario_kg || '1.0'),
    volumen_m3: String(data.volumen_m3 || '0.1'),
    requiere_frio: data.requiere_frio || false,
    unidad_medida: data.unidad_medida || 'UN',
    imagen_url: data.imagen_url || null,
    activo: true,
    created_at: new Date().toISOString(),
    deleted_at: null
  }
}

export async function deleteProduct(id: string): Promise<void> {
  return Promise.resolve()
}
