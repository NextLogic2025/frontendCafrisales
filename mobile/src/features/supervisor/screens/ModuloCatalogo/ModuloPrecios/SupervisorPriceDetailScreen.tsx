import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../../components/ui/SupervisorHeaderMenu'
import { GenericList } from '../../../../../components/ui/GenericList'
import { PrimaryButton } from '../../../../../components/ui/PrimaryButton'
import { CatalogSku, CatalogSkuService } from '../../../../../services/api/CatalogSkuService'
import { CatalogPriceService, CatalogSkuPrice } from '../../../../../services/api/CatalogPriceService'
import { BRAND_COLORS } from '../../../../../shared/types'

export function SupervisorPriceDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const skuParam: CatalogSku | null = route.params?.sku ?? null
  const skuId: string | undefined = route.params?.skuId ?? skuParam?.id

  const [sku, setSku] = React.useState<CatalogSku | null>(skuParam)
  const [history, setHistory] = React.useState<CatalogSkuPrice[]>([])
  const [loading, setLoading] = React.useState(false)

  const loadSku = React.useCallback(async () => {
    if (!skuId) return
    const data = await CatalogSkuService.getSku(skuId)
    if (data) {
      setSku(data)
      if (data.precios?.length) {
        const sorted = [...data.precios].sort((a, b) => (a.vigente_desde < b.vigente_desde ? 1 : -1))
        setHistory(sorted)
      }
    }
  }, [skuId])

  const loadHistory = React.useCallback(async () => {
    if (!skuId) return
    setLoading(true)
    try {
      const data = await CatalogPriceService.getPriceHistory(skuId)
      setHistory(data)
    } finally {
      setLoading(false)
    }
  }, [skuId])

  React.useEffect(() => {
    loadSku()
    loadHistory()
  }, [loadSku, loadHistory])

  useFocusEffect(
    React.useCallback(() => {
      loadSku()
      loadHistory()
    }, [loadSku, loadHistory]),
  )

  const currentPrice = history.find((item) => !item.vigente_hasta)

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Detalle de precio"
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu />}
      />

      <View className="flex-1 px-5 py-4 gap-4">
        <View className="bg-white rounded-3xl border border-neutral-200 p-5 gap-3" style={styles.card}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-neutral-500">SKU</Text>
              <Text className="text-lg font-bold text-neutral-900">{sku?.codigo_sku ?? '---'}</Text>
            </View>
            <View className="w-12 h-12 rounded-2xl items-center justify-center border border-red-100 bg-red-50">
              <Ionicons name="cash-outline" size={22} color={BRAND_COLORS.red} />
            </View>
          </View>

          <Text className="text-sm text-neutral-500">{sku?.nombre ?? 'Sin nombre'}</Text>
          <Text className="text-sm text-neutral-500">
            Producto: {sku?.producto?.nombre ?? 'Sin producto'}
          </Text>

          <View className="flex-row items-center justify-between bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3">
            <Text className="text-sm text-neutral-600">Precio vigente</Text>
            <Text className="text-base font-bold text-neutral-900">
              {currentPrice ? `${currentPrice.moneda} ${currentPrice.precio}` : 'Sin precio'}
            </Text>
          </View>
        </View>

        <PrimaryButton
          title="Actualizar precio"
          onPress={() => navigation.navigate('SupervisorPriceForm', { sku })}
        />

        <View className="flex-1 bg-white rounded-3xl border border-neutral-200 p-5">
          <Text className="text-base font-bold text-neutral-900 mb-3">Historial de precios</Text>
          <GenericList
            items={history}
            onRefresh={loadHistory}
            isLoading={loading}
            emptyState={{
              icon: 'cash-outline',
              title: 'Sin historial',
              message: 'Este SKU aun no tiene precios registrados.',
            }}
            renderItem={(item) => (
              <View className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 mb-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-neutral-900">
                    {item.moneda} {item.precio}
                  </Text>
                  {!item.vigente_hasta ? (
                    <View className="px-2 py-1 rounded-full bg-green-50 border border-green-100">
                      <Text className="text-[10px] font-semibold text-green-700">Vigente</Text>
                    </View>
                  ) : null}
                </View>
                <Text className="text-xs text-neutral-500 mt-1">
                  Desde: {new Date(item.vigente_desde).toLocaleDateString()}
                </Text>
                <Text className="text-xs text-neutral-500">
                  Hasta: {item.vigente_hasta ? new Date(item.vigente_hasta).toLocaleDateString() : 'En curso'}
                </Text>
              </View>
            )}
          />
        </View>
      </View>
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
