import React from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { FloatingIconButton } from '../../../../components/ui/FloatingIconButton'
import { BRAND_COLORS } from '../../../../shared/types'
import { CreditService, CreditListItem } from '../../../../services/api/CreditService'
import { UserClientService } from '../../../../services/api/UserClientService'

const formatMoney = (value: number) => {
  const fixed = Number.isFinite(value) ? value.toFixed(2) : '0.00'
  return `USD ${fixed}`
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function SupervisorCreditsScreen() {
  const navigation = useNavigation<any>()
  const [credits, setCredits] = React.useState<CreditListItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [clientNameMap, setClientNameMap] = React.useState<Record<string, string>>({})
  const [search, setSearch] = React.useState('')

  const loadCredits = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await CreditService.getCreditsAll(['activo', 'vencido', 'pagado'])
      setCredits(data)

      const uniqueClientIds = Array.from(new Set(data.map((credit) => credit.cliente_id).filter(Boolean)))
      if (uniqueClientIds.length === 0) {
        setClientNameMap({})
        return
      }
      const pairs = await Promise.all(
        uniqueClientIds.map(async (clienteId) => {
          const client = await UserClientService.getClient(clienteId)
          return [clienteId, client?.nombre_comercial || client?.ruc || clienteId] as const
        }),
      )
      setClientNameMap(Object.fromEntries(pairs))
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadCredits()
    }, [loadCredits]),
  )

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return credits
    return credits.filter((item) => {
      const clientLabel = clientNameMap[item.cliente_id]?.toLowerCase() || ''
      return (
        item.pedido_id?.toLowerCase().includes(term) ||
        item.cliente_id?.toLowerCase().includes(term) ||
        clientLabel.includes(term)
      )
    })
  }, [credits, search, clientNameMap])

  const renderItem = ({ item }: { item: CreditListItem }) => {
    const estado = item.estado || 'activo'
    const estadoColor =
      estado === 'pagado' ? '#059669' : estado === 'vencido' ? BRAND_COLORS.red : '#2563EB'
    const saldo = item.saldo ?? (item.monto_aprobado || 0)
    const clientLabel = clientNameMap[item.cliente_id] || item.cliente_id

    return (
      <Pressable
        onPress={() => navigation.navigate('SupervisorCreditoDetalle', { creditId: item.id })}
        className="bg-white rounded-2xl border border-neutral-100 p-4 mb-4 shadow-sm"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Pedido</Text>
            <Text className="text-base font-bold text-neutral-900">{item.pedido_id?.slice(0, 8)}...</Text>
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
              {formatMoney(Number(item.monto_aprobado ?? 0))}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-neutral-500">Saldo</Text>
            <Text className="text-sm font-semibold text-neutral-900">{formatMoney(Number(saldo))}</Text>
          </View>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Cliente</Text>
            <Text className="text-xs text-neutral-700" numberOfLines={1}>{clientLabel}</Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-neutral-500">Vence</Text>
            <Text className="text-xs text-neutral-700">{formatDate(item.fecha_vencimiento)}</Text>
          </View>
        </View>
      </Pressable>
    )
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Creditos" variant="standard" rightElement={<SupervisorHeaderMenu />} />

      <View className="px-5 mt-4">
        <View className="bg-white rounded-2xl border border-neutral-100 px-4 py-3 flex-row items-center">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Buscar por cliente o pedido"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-sm text-neutral-800 ml-2"
          />
        </View>
      </View>

      {loading && credits.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <FlatList
          data={filtered}
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
                No hay creditos registrados.
              </Text>
            </View>
          }
        />
      )}

      <FloatingIconButton
        icon="checkmark-done-outline"
        accessibilityLabel="Aprobar creditos"
        onPress={() => navigation.navigate('SupervisorSolicitudesCredito')}
      />
    </View>
  )
}
