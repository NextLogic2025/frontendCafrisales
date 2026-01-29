import React from 'react'
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Header } from '../../../../components/ui/Header'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { OrderListItem, OrderService } from '../../../../services/api/OrderService'
import { UserClientService } from '../../../../services/api/UserClientService'

type HistoryTab = 'validado' | 'ajustado' | 'cancelado'

const matchesTab = (order: OrderListItem, tab: HistoryTab) => {
  const estado = order.estado || ''
  if (tab === 'validado') return estado === 'validado'
  if (tab === 'ajustado') return ['ajustado_bodega', 'aceptado_cliente'].includes(estado)
  return ['cancelado', 'rechazado_cliente'].includes(estado)
}

export function WarehouseHistoryScreen() {
  const navigation = useNavigation<any>()
  const [orders, setOrders] = React.useState<OrderListItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [clientNameMap, setClientNameMap] = React.useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = React.useState<HistoryTab>('validado')

  const loadOrders = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await OrderService.getOrders()
      setOrders(data)
      const uniqueClientIds = Array.from(new Set(data.map((order) => order.cliente_id).filter(Boolean)))
      if (uniqueClientIds.length === 0) {
        setClientNameMap({})
        return
      }
      const pairs = await Promise.all(
        uniqueClientIds.map(async (clienteId) => {
          const client = await UserClientService.getClient(clienteId as string)
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
      loadOrders()
    }, [loadOrders]),
  )

  const normalizedSearch = search.trim().toLowerCase()
  const filtered = orders.filter((order) => {
    if (!normalizedSearch) return true
    const clientLabel = order.cliente_id ? clientNameMap[order.cliente_id] || order.cliente_id : ''
    const pedidoLabel = order.numero_pedido || order.id
    return clientLabel.toLowerCase().includes(normalizedSearch) || pedidoLabel.toLowerCase().includes(normalizedSearch)
  })

  const dataByTab = filtered.filter((order) => matchesTab(order, activeTab))

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Historial de validaciones" variant="standard" />

      <View className="px-5 pt-4">
        <LinearGradient
          colors={dataByTab.length === 0 ? ['#7F1D1D', '#991B1B'] : ['#0F172A', '#1E293B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 18, padding: 14, marginBottom: 14 }}
        >
          <Text className="text-xs text-slate-200">Resumen</Text>
          <Text className={`text-lg font-bold mt-1 ${dataByTab.length === 0 ? 'text-red-100' : 'text-white'}`}>
            {dataByTab.length} pedidos {activeTab === 'validado' ? 'validados' : activeTab === 'ajustado' ? 'ajustados' : 'cancelados'}
          </Text>
        </LinearGradient>
        <View className="bg-white rounded-xl border border-neutral-200 px-3 py-2">
          <TextInput
            placeholder="Buscar por cliente o pedido"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            className="text-neutral-900"
          />
        </View>

        <View className="flex-row gap-2 mt-4">
          {(['validado', 'ajustado', 'cancelado'] as HistoryTab[]).map((tab) => {
            const isActive = activeTab === tab
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full border ${isActive ? 'bg-brand-red/10 border-brand-red' : 'border-neutral-200'
                  }`}
              >
                <Text className={`text-xs font-semibold ${isActive ? 'text-brand-red' : 'text-neutral-600'}`}>
                  {tab === 'validado' ? 'Validados' : tab === 'ajustado' ? 'Ajustados' : 'Cancelados'}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      {loading && orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <FlatList
          data={dataByTab}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const clientLabel = item.cliente_id ? clientNameMap[item.cliente_id] || item.cliente_id : 'Cliente'
            const estado = item.estado || 'pendiente_validacion'
            const total = Number(item.total ?? 0)
            return (
              <Pressable
                onPress={() => navigation.navigate('WarehouseHistorialDetalle', { orderId: item.id })}
                className="bg-white rounded-2xl border border-neutral-100 p-4 mb-4 shadow-sm"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-xs text-neutral-500">Pedido</Text>
                    <Text className="text-base font-bold text-neutral-900">
                      #{item.numero_pedido || item.id?.slice?.(0, 8)}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${
                    estado === 'validado' ? 'bg-emerald-50' :
                    estado === 'ajustado_bodega' || estado === 'aceptado_cliente' ? 'bg-amber-50' :
                    'bg-red-50'
                  }`}>
                    <Text className={`text-xs font-semibold ${
                      estado === 'validado' ? 'text-emerald-700' :
                      estado === 'ajustado_bodega' || estado === 'aceptado_cliente' ? 'text-amber-700' :
                      'text-red-700'
                    }`}>
                      {estado.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View className="mt-3 flex-row justify-between">
                  <View>
                    <Text className="text-xs text-neutral-500">Cliente</Text>
                    <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
                      {clientLabel}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-neutral-500">Total</Text>
                    <Text className="text-sm font-semibold text-neutral-900">
                      USD {Number.isFinite(total) ? total.toFixed(2) : '0.00'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )
          }}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-14">
              <View className="p-4 rounded-full bg-neutral-100 mb-4">
                <Ionicons name="time-outline" size={36} color="#64748B" />
              </View>
              <Text className="text-lg font-bold text-neutral-900 mb-2">Sin resultados</Text>
              <Text className="text-sm text-neutral-500 text-center">
                No hay pedidos en este estado.
              </Text>
            </View>
          }
        />
      )}
    </View>
  )
}
