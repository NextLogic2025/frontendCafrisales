import { useState } from 'react'
import { type ProductoPromocion } from './promocionesApi'
import { type Product } from './productosApi'

export function usePromocionesProductos() {
  const [productos, setProductos] = useState<Product[]>([])
  const [productosPromo, setProductosPromo] = useState<ProductoPromocion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProductos = async () => {
    setIsLoading(false)
    setProductos([])
  }

  const loadProductosPromo = async (campaniaId: string | number) => {
    setIsLoading(false)
    setProductosPromo([])
  }

  const addProducto = async (campaniaId: string | number, productoId: string) => {
    return { success: true, message: 'Producto agregado exitosamente' }
  }

  const removeProducto = async (campaniaId: string | number, productoId: string) => {
    return { success: true, message: 'Producto removido exitosamente' }
  }

  return {
    productos,
    productosPromo,
    isLoading,
    error,
    loadProductos,
    loadProductosPromo,
    addProducto,
    removeProducto,
  }
}
