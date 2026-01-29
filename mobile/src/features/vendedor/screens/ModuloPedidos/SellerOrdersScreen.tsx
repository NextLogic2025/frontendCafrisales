import React from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { jwtDecode } from 'jwt-decode'
import { Header } from '../../../../components/ui/Header'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { OrderListCard } from '../../../../components/orders/OrderListCard'
import { OrderListItem, OrderService } from '../../../../services/api/OrderService'
import { UserClient, UserClientService } from '../../../../services/api/UserClientService'
import { getValidToken } from '../../../../services/auth/authClient'

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

export function SellerOrdersScreen() {
  const navigation = useNavigation<any>()
  const [orders, setOrders] = React.useState<OrderListItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [clients, setClients] = React.useState<UserClient[]>([])
  const [clientNameMap, setClientNameMap] = React.useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = React.useState<StatusTab>('pendientes')
  const [searchText, setSearchText] = React.useState('')
  const [clientModalVisible, setClientModalVisible] = React.useState(false)
  const [clientSearch, setClientSearch] = React.useState('')
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null)
  const [createdByMeOnly, setCreatedByMeOnly] = React.useState(false)
  const [vendedorId, setVendedorId] = React.useState<string | null>(null)

  const loadOrders = React.useCallback(async () => {
    setLoading(true)
    try {
      const token = await getValidToken()
      if (!token) {
        setOrders([])
        return
      }
      const decoded = jwtDecode<{ sub?: string; userId?: string }>(token)
      const vendedor = decoded.sub || decoded.userId
      setVendedorId(vendedor || null)

      const vendedorClients = vendedor ? await UserClientService.getClientsByVendedor(vendedor) : []
      setClients(vendedorClients)
      const clientIds = new Set(vendedorClients.map((client) => client.usuario_id))
      const mapEntries = vendedorClients.map(
        (client) => [client.usuario_id, client.nombre_comercial || client.ruc || client.usuario_id] as const,
      )
      setClientNameMap(Object.fromEntries(mapEntries))

      const allOrders = await OrderService.getOrders()
      const visibleOrders = allOrders.filter((order) => {
        const isClientOrder = order.cliente_id && clientIds.has(order.cliente_id)
        const isCreatedByMe = vendedor && ((order as any).creado_por_id === vendedor || (order as any).creado_por === vendedor)
        return isClientOrder || isCreatedByMe
      })
      setOrders(visibleOrders)
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
  const matchesSearch = (value: string) => value.toLowerCase().includes(normalizedSearch)

  const filteredOrders = orders.filter((order) => {
    if (createdByMeOnly && vendedorId) {
      const createdByMe = (order as any).creado_por_id === vendedorId || (order as any).creado_por === vendedorId
      if (!createdByMe) return false
    }
    if (selectedClientId && order.cliente_id !== selectedClientId) return false
    if (!normalizedSearch) return true
    const clientLabel = order.cliente_id ? clientNameMap[order.cliente_id] || order.cliente_id : ''
    const pedidoLabel = order.numero_pedido || order.id
    return matchesSearch(clientLabel || '') || matchesSearch(pedidoLabel || '')
  })

  const ordersByStatus = filteredOrders.filter((order) => orderMatchesStatus(order, activeTab))

  const renderItem = ({ item }: { item: OrderListItem }) => (
    <OrderListCard
      order={item}
      clientLabel={item.cliente_id ? clientNameMap[item.cliente_id] || item.cliente_id : 'Cliente'}
      onPress={() => navigation.navigate('SellerPedidoDetalle', { orderId: item.id })}
    />
  )

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Pedidos" variant="standard" rightElement={<SellerHeaderMenu />} />

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

      <View className="px-5 pb-2">
        <Pressable
          onPress={() => setCreatedByMeOnly((prev) => !prev)}
          className={`px-4 py-2 rounded-full border ${createdByMeOnly ? 'bg-brand-red border-brand-red' : 'bg-white border-neutral-200'}`}
        >
          <Text className={`text-xs font-semibold ${createdByMeOnly ? 'text-white' : 'text-neutral-600'}`}>
            Creados por mi
          </Text>
        </Pressable>
      </View>

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
            {clients
              .filter((client) => {
                if (!clientSearch.trim()) return true
                const query = clientSearch.trim().toLowerCase()
                const label = `${client.nombre_comercial || ''} ${client.ruc || ''}`.toLowerCase()
                return label.includes(query)
              })
              .map((client) => (
                <Pressable
                  key={client.usuario_id}
                  onPress={() => {
                    setSelectedClientId(client.usuario_id)
                    setClientModalVisible(false)
                  }}
                  className="px-4 py-3 rounded-xl border border-neutral-100 bg-white mb-2"
                >
                  <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
                    {client.nombre_comercial || client.ruc || client.usuario_id}
                  </Text>
                  {client.ruc ? <Text className="text-xs text-neutral-500">RUC: {client.ruc}</Text> : null}
                </Pressable>
              ))}
            {clients.length === 0 && (
              <Text className="text-sm text-neutral-500 text-center py-6">No hay clientes.</Text>
            )}
          </View>
        </View>
      </GenericModal>
    </View>
  )
}
