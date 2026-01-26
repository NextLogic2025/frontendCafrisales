import React from 'react'
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../../components/ui/SupervisorHeaderMenu'
import { PrimaryButton } from '../../../../../components/ui/PrimaryButton'
import { BRAND_COLORS } from '../../../../../shared/types'
import { CatalogProduct, CatalogProductService } from '../../../../../services/api/CatalogProductService'

export function SupervisorProductDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const productParam: CatalogProduct | undefined = route.params?.product
  const productId: string | undefined = productParam?.id || route.params?.productId

  const [product, setProduct] = React.useState<CatalogProduct | null>(productParam ?? null)
  const [loading, setLoading] = React.useState(false)
  const getCurrentPrice = React.useCallback((sku: CatalogProduct['skus'][number]) => {
    const current = sku.precios?.find((price) => !price.vigente_hasta)
    if (!current) return 'Sin precio'
    return `${current.moneda} ${current.precio}`
  }, [])

  const loadData = React.useCallback(async () => {
    if (!productId) return
    setLoading(true)
    try {
      const data = await CatalogProductService.getProduct(productId)
      setProduct(data)
    } finally {
      setLoading(false)
    }
  }, [productId])

  React.useEffect(() => {
    loadData()
    const unsubscribe = navigation.addListener('focus', loadData)
    return unsubscribe
  }, [loadData, navigation])

  if (loading && !product) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header title="Detalle Producto" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SupervisorHeaderMenu />} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
          <Text className="text-neutral-500 mt-4 text-sm">Cargando informacion...</Text>
        </View>
      </View>
    )
  }

  if (!product) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header title="Detalle Producto" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SupervisorHeaderMenu />} />
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-neutral-100 w-20 h-20 rounded-full items-center justify-center mb-4">
            <Ionicons name="search-outline" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-lg font-bold text-neutral-900 text-center mb-2">Producto no encontrado</Text>
          <Text className="text-neutral-500 text-center">No se pudo cargar la informacion del producto.</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Detalle Producto" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SupervisorHeaderMenu />} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={BRAND_COLORS.red} />}
      >
        <View className="px-5 py-4">
          <View className="bg-white p-5 rounded-3xl border border-neutral-200" style={styles.card}>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-2xl bg-red-50 items-center justify-center mr-3 border border-red-100">
                  <Ionicons name="cube-outline" size={22} color={BRAND_COLORS.red} />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-neutral-900" numberOfLines={2}>
                    {product.nombre}
                  </Text>
                  <Text className="text-neutral-500 text-sm mt-1">Producto del catalogo</Text>
                </View>
              </View>
              <View className="px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200">
                <Text className="text-xs font-semibold text-neutral-700">{product.slug}</Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-neutral-500 text-xs font-medium mb-2">Categoria</Text>
              <Text className="text-neutral-900 text-sm">{product.categoria?.nombre ?? 'Sin categoria'}</Text>
            </View>

            {product.descripcion ? (
              <View className="mb-4">
                <Text className="text-neutral-500 text-xs font-medium mb-1">Descripcion</Text>
                <Text className="text-neutral-900 text-sm font-semibold">{product.descripcion}</Text>
              </View>
            ) : null}

            <View className="flex-row items-center justify-between bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3">
              <View>
                <Text className="text-xs text-neutral-500">SKUs asociados</Text>
                <Text className="text-neutral-900 font-semibold">{product.skus?.length ?? 0}</Text>
              </View>
              <Ionicons name="barcode-outline" size={18} color="#9CA3AF" />
            </View>
          </View>

          <View className="mt-5">
            <Text className="text-sm font-bold text-neutral-900 mb-3">Detalle de SKUs</Text>
            {product.skus?.length ? (
              product.skus.map((sku) => (
                <View key={sku.id} className="bg-white border border-neutral-200 rounded-2xl px-4 py-4 mb-3" style={styles.card}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-3">
                      <Text className="text-base font-bold text-neutral-900">{sku.nombre}</Text>
                      <Text className="text-xs text-neutral-500 mt-1">
                        {sku.codigo_sku} • {sku.peso_gramos}g
                      </Text>
                      <Text className="text-xs text-neutral-500 mt-1">
                        Precio vigente: <Text className="text-neutral-900 font-semibold">{getCurrentPrice(sku)}</Text>
                      </Text>
                    </View>
                    <View className="w-10 h-10 rounded-xl items-center justify-center border border-red-100 bg-red-50">
                      <Ionicons name="barcode-outline" size={20} color={BRAND_COLORS.red} />
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className="bg-white border border-dashed border-neutral-300 rounded-2xl px-4 py-4">
                <Text className="text-sm text-neutral-600">Aun no hay SKUs asociados.</Text>
              </View>
            )}
          </View>

          <View className="mt-6">
            <PrimaryButton title="Editar producto" onPress={() => navigation.navigate('SupervisorProductForm', { product })} />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
})
