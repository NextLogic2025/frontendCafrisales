export interface ListaPrecio {
  id: number
  nombre: string
}

export interface PrecioItem {
  lista_id: number
  producto_id: string
  precio: number
  habilitado?: boolean
  lista?: ListaPrecio
  producto?: {
    id: string
    codigo_sku: string
    nombre: string
  }
}

export interface AsignarPrecioDto {
  productoId: string
  listaId: number
  precio: number
  habilitado?: boolean
}

export interface CreateListaPrecioDto {
  nombre: string
}
