import React from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { OrderListCard } from '../../../../components/orders/OrderListCard'
import { OrderListItem, OrderService } from '../../../../services/api/OrderService'
import { UserClientService } from '../../../../services/api/UserClientService'

type StatusTab = 'pendientes' | 'en_ruta' | 'entregados' | 'cancelados'

const orderMatchesStatus = (order: OrderListItem, tab: StatusTab) => {
  const estado = order.estado || 'pendiente_validacion'
  if (tab === 'pendientes') {
    return ['pendiente_validacion', 'ajustado_bodega', 'aceptado_cliente', 'validado'].includes(estado)
  }
  if (tab === 'en_ruta') {
    return ['asignado_ruta', 'en_ruta'].includes(estado)
  }
  if (tab === 'entregados') {
    return estado === 'entregado'
  }
  return ['cancelado', 'rechazado_cliente'].includes(estado)
}

export function SupervisorOrdersScreen() {
  const navigation = useNavigation<any>()
  const [orders, setOrders] = React.useState<OrderListItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [clientNameMap, setClientNameMap] = React.useState<Record<string, string>>({})
  const [searchText, setSearchText] = React.useState('')
  const [clientModalVisible, setClientModalVisible] = React.useState(false)
  const [clientSearch, setClientSearch] = React.useState('')
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<StatusTab>('pendientes')

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
      loadOrders()
    }, [loadOrders]),
  )

  const normalizedSearch = searchText.trim().toLowerCase()
  const filteredOrders = orders.filter((order) => {
    if (selectedClientId && order.cliente_id !== selectedClientId) return false
    if (!normalizedSearch) return true
    const clientLabel = order.cliente_id ? clientNameMap[order.cliente_id] || order.cliente_id : ''
    const pedidoLabel = order.numero_pedido || order.id
    return clientLabel.toLowerCase().includes(normalizedSearch) || pedidoLabel.toLowerCase().includes(normalizedSearch)
  })

  const ordersByStatus = filteredOrders.filter((order) => orderMatchesStatus(order, activeTab))

  const renderItem = ({ item }: { item: OrderListItem }) => (
    <OrderListCard
      order={item}
      clientLabel={item.cliente_id ? clientNameMap[item.cliente_id] || item.cliente_id : 'Cliente'}
      onPress={() => navigation.navigate('SupervisorPedidoDetalle', { orderId: item.id })}
    />
  )

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Pedidos" variant="standard" rightElement={<SupervisorHeaderMenu />} />

      <CategoryFilter
        categories={[
          { id: 'pendientes', name: 'Pendientes' },
          { id: 'en_ruta', name: 'En ruta' },
          { id: 'entregados', name: 'Entregados' },
          { id: 'cancelados', name: 'Cancelados' },
        ]}
        selectedId={activeTab}
        onSelect={(id) => setActiveTab(id as StatusTab)}
        searchValue={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Buscar por cliente o pedido"
        actionLabel="Cliente"
        onActionPress={() => setClientModalVisible(true)}
      />

      {loading && orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <FlatList
          data={ordersByStatus}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadOrders} tintColor={BRAND_COLORS.red} />}
          ListEmptyComponent={
            <View className="items-center justify-center py-14">
              <View className="p-4 rounded-full bg-red-50 mb-4">
                <Ionicons name="receipt-outline" size={36} color={BRAND_COLORS.red} />
              </View>
              <Text className="text-lg font-bold text-neutral-900 mb-2">Sin pedidos</Text>
              <Text className="text-sm text-neutral-500 text-center">
                No hay pedidos para mostrar con los filtros actuales.
              </Text>
            </View>
          }
        />
      )}

      <GenericModal
        visible={clientModalVisible}
        title="Seleccionar cliente"
        onClose={() => setClientModalVisible(false)}
      >
        <View className="gap-4">
          <SearchBar
            value={clientSearch}
            onChangeText={setClientSearch}
            onClear={() => setClientSearch('')}
            placeholder="Buscar cliente"
          />
          <Pressable
            onPress={() => {
              setSelectedClientId(null)
              setClientModalVisible(false)
            }}
            className="px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50"
          >
            <Text className="text-sm font-semibold text-neutral-700">Todos los clientes</Text>
          </Pressable>
          <View className="max-h-80">
            {Object.entries(clientNameMap)
              .filter(([_, name]) => {
                if (!clientSearch.trim()) return true
                return name.toLowerCase().includes(clientSearch.trim().toLowerCase())
              })
              .map(([id, name]) => (
                <Pressable
                  key={id}
                  onPress={() => {
                    setSelectedClientId(id)
                    setClientModalVisible(false)
                  }}
                  className="px-4 py-3 rounded-xl border border-neutral-100 bg-white mb-2"
                >
                  <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
                    {name}
                  </Text>
                </Pressable>
              ))}
            {Object.keys(clientNameMap).length === 0 && (
              <Text className="text-sm text-neutral-500 text-center py-6">No hay clientes.</Text>
            )}
          </View>
        </View>
      </GenericModal>
    </View>
  )
}
