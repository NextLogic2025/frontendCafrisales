import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { ProductCatalogTemplate } from '../../../../components/catalog/ProductCatalogTemplate'

export function ClientProductsScreen() {
  const navigation = useNavigation<any>()
  return (
    <ProductCatalogTemplate
      title="Productos"
      onProductPress={(product) => navigation.navigate('ClientProductDetail', { productId: product.id })}
    />
  )
}
