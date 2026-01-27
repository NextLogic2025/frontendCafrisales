import React from 'react'
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { jwtDecode } from 'jwt-decode'
import { Header } from '../../../../components/ui/Header'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { BRAND_COLORS } from '../../../../shared/types'
import { CreditListItem, CreditService } from '../../../../services/api/CreditService'
import { getValidToken } from '../../../../services/auth/authClient'

const formatMoney = (value: number) => {
  const fixed = Number.isFinite(value) ? value.toFixed(2) : '0.00'
  return `USD ${fixed}`
}

export function SellerCreditsScreen() {
  const [credits, setCredits] = React.useState<CreditListItem[]>([])
  const [loading, setLoading] = React.useState(false)

  const loadCredits = React.useCallback(async () => {
    setLoading(true)
    try {
      const token = await getValidToken()
      if (!token) {
        setCredits([])
        return
      }
      const decoded = jwtDecode<{ sub?: string; userId?: string }>(token)
      const vendedorId = decoded.sub || decoded.userId
      if (!vendedorId) {
        setCredits([])
        return
      }
      const data = await CreditService.getCreditsBySeller(vendedorId, ['activo', 'vencido', 'pagado'])
      setCredits(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadCredits()
    }, [loadCredits]),
  )

  const renderItem = ({ item }: { item: CreditListItem }) => {
    const estado = item.estado || 'activo'
    const estadoColor =
      estado === 'pagado' ? '#059669' : estado === 'vencido' ? BRAND_COLORS.red : '#2563EB'
    const saldo = item.saldo ?? (item.monto_aprobado || 0)

    return (
      <View className="bg-white rounded-2xl border border-neutral-100 p-4 mb-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Pedido</Text>
            <Text className="text-base font-bold text-neutral-900">{item.pedido_id}</Text>
          </View>
          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${estadoColor}22` }}>
            <Text className="text-xs font-semibold" style={{ color: estadoColor }}>
              {estado.toUpperCase()}
            </Text>
          </View>
        </View>

        <View className="mt-3 flex-row justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Monto aprobado</Text>
            <Text className="text-sm font-semibold text-neutral-900">
              {formatMoney(item.monto_aprobado ?? 0)}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-neutral-500">Saldo</Text>
            <Text className="text-sm font-semibold text-neutral-900">{formatMoney(saldo)}</Text>
          </View>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Cliente</Text>
            <Text className="text-xs text-neutral-700">{item.cliente_id}</Text>
          </View>
          {item.fecha_vencimiento && (
            <View className="items-end">
              <Text className="text-xs text-neutral-500">Vence</Text>
              <Text className="text-xs text-neutral-700">{item.fecha_vencimiento}</Text>
            </View>
          )}
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Creditos" variant="standard" rightElement={<SellerHeaderMenu />} />

      {loading && credits.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <FlatList
          data={credits}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCredits} tintColor={BRAND_COLORS.red} />}
          ListEmptyComponent={
            <View className="items-center justify-center py-14">
              <View className="p-4 rounded-full bg-red-50 mb-4">
                <Ionicons name="cash-outline" size={36} color={BRAND_COLORS.red} />
              </View>
              <Text className="text-lg font-bold text-neutral-900 mb-2">Sin creditos</Text>
              <Text className="text-sm text-neutral-500 text-center">
                Todavia no tienes creditos registrados.
              </Text>
            </View>
          }
        />
      )}
    </View>
  )
}
