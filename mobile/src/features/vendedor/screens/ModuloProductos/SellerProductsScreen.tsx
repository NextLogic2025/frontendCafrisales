import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { ProductCatalogTemplate } from '../../../../components/catalog/ProductCatalogTemplate'

export function SellerProductsScreen() {
  const navigation = useNavigation<any>()
  return (
    <ProductCatalogTemplate
      title="Productos"
      onProductPress={(product) => navigation.navigate('SellerProductDetail', { productId: product.id })}
    />
  )
}
