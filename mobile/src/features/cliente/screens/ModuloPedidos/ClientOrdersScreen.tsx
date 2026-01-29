import React from 'react'
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { ClientHeaderMenu } from '../../../../components/ui/ClientHeaderMenu'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderListCard } from '../../../../components/orders/OrderListCard'
import { OrderListItem, OrderService } from '../../../../services/api/OrderService'
import { FloatingIconButton } from '../../../../components/ui/FloatingIconButton'

type StatusTab = 'pendientes' | 'validados' | 'en_ruta' | 'entregados' | 'cancelados'

const orderMatchesStatus = (order: OrderListItem, tab: StatusTab) => {
  const estado = order.estado || 'pendiente_validacion'
  if (tab === 'pendientes') {
    return ['pendiente_validacion', 'ajustado_bodega', 'aceptado_cliente', 'validado'].includes(estado)
  }
  if (tab === 'validados') {
    return estado === 'validado'
  }
  if (tab === 'en_ruta') {
    return ['asignado_ruta', 'en_ruta'].includes(estado)
  }
  if (tab === 'entregados') {
    return estado === 'entregado'
  }
  return ['cancelado', 'rechazado_cliente'].includes(estado)
}

export function ClientOrdersScreen() {
  const navigation = useNavigation<any>()
  const [orders, setOrders] = React.useState<OrderListItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<StatusTab>('pendientes')
  const [searchText, setSearchText] = React.useState('')

  const loadOrders = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await OrderService.getMyOrders()
      setOrders(data)
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
  const filtered = orders.filter((order) => {
    if (!normalizedSearch) return true
    const label = order.numero_pedido || order.id
    return label?.toLowerCase().includes(normalizedSearch)
  })

  const ordersByStatus = filtered.filter((order) => orderMatchesStatus(order, activeTab))

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Pedidos" variant="standard" rightElement={<ClientHeaderMenu />} />

      <CategoryFilter
        categories={[
          { id: 'pendientes', name: 'Pendientes' },
          { id: 'validados', name: 'Validados' },
          { id: 'en_ruta', name: 'En ruta' },
          { id: 'entregados', name: 'Entregados' },
          { id: 'cancelados', name: 'Cancelados' },
        ]}
        selectedId={activeTab}
        onSelect={(id) => setActiveTab(id as StatusTab)}
        searchValue={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Buscar por pedido"
      />

      {loading && orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <FlatList
          data={ordersByStatus}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderListCard
              order={item}
              showClient={false}
              onPress={() => navigation.navigate('ClientePedidoDetalle', { orderId: item.id })}
            />
          )}
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

      <FloatingIconButton
        icon="alert-circle-outline"
        accessibilityLabel="Ajustes de pedido"
        onPress={() => navigation.navigate('ClienteAjustesPedido')}
      />
    </View>
  )
}
