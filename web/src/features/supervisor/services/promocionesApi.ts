export interface Campania {
  id: number
  nombre: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string
  tipo_descuento: string | null
  valor_descuento: string | null
  alcance?: string | null
  lista_precios_objetivo_id?: number | null
  imagen_banner_url: string | null
  activo: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ProductoPromocion {
  campania_id: number
  producto_id: string
  precio_oferta_fijo: string | null
  producto?: {
    id: string
    codigo_sku: string
    nombre: string
  }
}

export interface CreateCampaniaDto {
  nombre: string
  descripcion?: string
  fecha_inicio: string
  fecha_fin: string
  tipo_descuento?: 'PORCENTAJE' | 'MONTO_FIJO'
  valor_descuento?: number
  alcance?: 'GLOBAL' | 'POR_LISTA' | 'POR_CLIENTE'
  lista_precios_objetivo_id?: number
  imagen_banner_url?: string
  activo?: boolean
}

export interface AddProductoPromoDto {
  producto_id: string
  precio_oferta_fijo?: number
}

export interface ClienteCampania {
  campania_id: number
  cliente_id: string
  cliente?: {
    id: string
    identificacion: string
    razon_social: string
  }
}

export interface AddClienteCampaniaDto {
  cliente_id: string
}

export async function getAllCampanias(): Promise<Campania[]> {
  return []
}

export async function getCampaniaById(id: number): Promise<Campania | null> {
  return {
    id,
    nombre: 'Campania Mock',
    descripcion: null,
    fecha_inicio: new Date().toISOString(),
    fecha_fin: new Date().toISOString(),
    tipo_descuento: null,
    valor_descuento: null,
    imagen_banner_url: null,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  }
}

export async function createCampania(data: CreateCampaniaDto): Promise<Campania> {
  return {
    id: Math.floor(Math.random() * 1000),
    nombre: data.nombre,
    descripcion: data.descripcion || null,
    fecha_inicio: data.fecha_inicio,
    fecha_fin: data.fecha_fin,
    tipo_descuento: data.tipo_descuento || null,
    valor_descuento: data.valor_descuento ? String(data.valor_descuento) : null,
    imagen_banner_url: data.imagen_banner_url || null,
    activo: data.activo ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  }
}

export async function updateCampania(id: number, data: Partial<CreateCampaniaDto>): Promise<Campania> {
  return getCampaniaById(id) as Promise<Campania>
}

export async function deleteCampania(id: number): Promise<void> {
  return Promise.resolve()
}

export async function getProductosByCampania(id: number): Promise<ProductoPromocion[]> {
  return []
}

export async function addProductoToCampania(campaniaId: number, data: AddProductoPromoDto): Promise<void> {
  return Promise.resolve()
}

export async function removeProductoFromCampania(campaniaId: number, productId: string): Promise<void> {
  return Promise.resolve()
}

export async function getClientesByCampania(id: number): Promise<ClienteCampania[]> {
  return []
}

export async function addClienteToCampania(campaniaId: number, data: AddClienteCampaniaDto): Promise<void> {
  return Promise.resolve()
}

export async function removeClienteFromCampania(campaniaId: number, clienteId: string): Promise<void> {
  return Promise.resolve()
}
