import React from 'react'
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../../components/ui/SupervisorHeaderMenu'
import { PrimaryButton } from '../../../../../components/ui/PrimaryButton'
import { BRAND_COLORS } from '../../../../../services/shared/types'
import { CatalogSku, CatalogSkuService } from '../../../../../services/api/CatalogSkuService'

export function SupervisorSkuDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const skuParam: CatalogSku | undefined = route.params?.sku
  const skuId: string | undefined = skuParam?.id || route.params?.skuId

  const [sku, setSku] = React.useState<CatalogSku | null>(skuParam ?? null)
  const [loading, setLoading] = React.useState(false)

  const loadData = React.useCallback(async () => {
    if (!skuId) return
    setLoading(true)
    try {
      const data = await CatalogSkuService.getSku(skuId)
      setSku(data)
    } finally {
      setLoading(false)
    }
  }, [skuId])

  React.useEffect(() => {
    loadData()
    const unsubscribe = navigation.addListener('focus', loadData)
    return unsubscribe
  }, [loadData, navigation])

  if (loading && !sku) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header title="Detalle SKU" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SupervisorHeaderMenu />} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
          <Text className="text-neutral-500 mt-4 text-sm">Cargando informacion...</Text>
        </View>
      </View>
    )
  }

  if (!sku) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header title="Detalle SKU" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SupervisorHeaderMenu />} />
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-neutral-100 w-20 h-20 rounded-full items-center justify-center mb-4">
            <Ionicons name="search-outline" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-lg font-bold text-neutral-900 text-center mb-2">SKU no encontrado</Text>
          <Text className="text-neutral-500 text-center">No se pudo cargar la informacion del SKU.</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Detalle SKU" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SupervisorHeaderMenu />} />

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
                  <Ionicons name="barcode-outline" size={22} color={BRAND_COLORS.red} />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-neutral-900" numberOfLines={2}>
                    {sku.codigo_sku}
                  </Text>
                  <Text className="text-neutral-500 text-sm mt-1">{sku.nombre}</Text>
                </View>
              </View>
              <View className="px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200">
                <Text className="text-xs font-semibold text-neutral-700">SKU</Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-neutral-500 text-xs font-medium mb-2">Producto asociado</Text>
              <Text className="text-neutral-900 text-sm">{sku.producto?.nombre ?? 'Sin producto'}</Text>
            </View>

            <View className="flex-row items-center justify-between bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3">
              <View>
                <Text className="text-xs text-neutral-500">Presentacion</Text>
                <Text className="text-neutral-900 font-semibold">{sku.peso_gramos} g</Text>
              </View>
              <Ionicons name="scale-outline" size={18} color="#9CA3AF" />
            </View>
          </View>

          <View className="mt-6">
            <PrimaryButton title="Editar SKU" onPress={() => navigation.navigate('SupervisorSkuForm', { sku })} />
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
    shadowRadius: 8,
    elevation: 3,
  },
})
