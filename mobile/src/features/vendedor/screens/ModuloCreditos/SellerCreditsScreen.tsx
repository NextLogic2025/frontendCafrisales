import React from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { jwtDecode } from 'jwt-decode'
import { Header } from '../../../../components/ui/Header'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { CreditListItem, CreditService } from '../../../../services/api/CreditService'
import { OrderListItem, OrderService } from '../../../../services/api/OrderService'
import { UserClient, UserClientService } from '../../../../services/api/UserClientService'
import { getValidToken } from '../../../../services/auth/authClient'

const currencyFormatter = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

const formatMoney = (value?: number | string | null) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return currencyFormatter.format(0)
  return currencyFormatter.format(amount)
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
}

const shortenId = (value?: string) => {
  if (!value) return '-'
  return `${value.slice(0, 8)}...`
}

export function SellerCreditsScreen() {
  const navigation = useNavigation<any>()
  const [credits, setCredits] = React.useState<CreditListItem[]>([])
  const [pendingOrders, setPendingOrders] = React.useState<OrderListItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [clientNameMap, setClientNameMap] = React.useState<Record<string, string>>({})
  const [clients, setClients] = React.useState<UserClient[]>([])
  const [activeTab, setActiveTab] = React.useState<'pendientes' | 'aprobados' | 'pagados' | 'rechazados'>('pendientes')
  const [searchText, setSearchText] = React.useState('')
  const [clientModalVisible, setClientModalVisible] = React.useState(false)
  const [clientSearch, setClientSearch] = React.useState('')
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null)

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
        setPendingOrders([])
        return
      }
      const vendedorClients = await UserClientService.getClientsByVendedor(vendedorId)
      setClients(vendedorClients)
      const clientIds = new Set(vendedorClients.map((client) => client.usuario_id))
      const mapEntries = vendedorClients.map(
        (client) => [client.usuario_id, client.nombre_comercial || client.ruc || client.usuario_id] as const,
      )
      setClientNameMap(Object.fromEntries(mapEntries))

      const creditData = await CreditService.getCreditsBySeller(vendedorId, ['activo', 'vencido', 'pagado'])
      setCredits(creditData)
      const approvedOrderIds = new Set(creditData.map((credit) => credit.pedido_id).filter(Boolean))

      const orders = await OrderService.getOrders()
      const pending = orders.filter(
        (order) =>
          order.metodo_pago === 'credito' &&
          order.estado === 'pendiente_validacion' &&
          order.cliente_id &&
          clientIds.has(order.cliente_id) &&
          !approvedOrderIds.has(order.id),
      )
      setPendingOrders(pending)
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
    const clienteLabel = clientNameMap[item.cliente_id] || item.cliente_id
    const pedidoLabel = item.pedido_id ? `#${shortenId(item.pedido_id)}` : '-'

    return (
      <Pressable
        onPress={() => navigation.navigate('CreditoDetalle', { creditId: item.id })}
        className="bg-white rounded-2xl border border-neutral-100 p-4 mb-4 shadow-sm"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Pedido</Text>
            <Text className="text-base font-bold text-neutral-900">{pedidoLabel}</Text>
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
            <Text className="text-xs text-neutral-700" numberOfLines={1}>
              {clienteLabel}
            </Text>
          </View>
          {item.fecha_vencimiento && (
            <View className="items-end">
              <Text className="text-xs text-neutral-500">Vence</Text>
              <Text className="text-xs text-neutral-700">{formatDate(item.fecha_vencimiento)}</Text>
            </View>
          )}
        </View>
      </Pressable>
    )
  }

  const getOrderTotal = (order: OrderListItem) => {
    const total = Number(order.total)
    if (Number.isFinite(total) && total > 0) return total
    if (order.items && order.items.length > 0) {
      return order.items.reduce((sum, item) => {
        const subtotal = Number(item?.subtotal)
        if (Number.isFinite(subtotal) && subtotal > 0) return sum + subtotal
        const unit = Number(item?.precio_unitario_final)
        const qty = Number(item?.cantidad_solicitada)
        if (Number.isFinite(unit) && Number.isFinite(qty)) return sum + unit * qty
        return sum
      }, 0)
    }
    return 0
  }

  const renderPendingItem = ({ item }: { item: OrderListItem }) => {
    const clienteLabel = item.cliente_id ? clientNameMap[item.cliente_id] || item.cliente_id : 'Cliente'
    const total = getOrderTotal(item)
    return (
      <Pressable
        onPress={() =>
          navigation.navigate('SolicitudCreditoDetalle', {
            orderId: item.id,
            clientName: clienteLabel,
            orderNumber: item.numero_pedido,
          })
        }
        className="bg-white rounded-2xl border border-neutral-100 p-4 mb-4 shadow-sm"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Pedido</Text>
            <Text className="text-base font-bold text-neutral-900">#{item.numero_pedido || item.id.slice(0, 8)}</Text>
          </View>
          <View className="px-3 py-1 rounded-full bg-amber-50">
            <Text className="text-xs font-semibold text-amber-700">PENDIENTE</Text>
          </View>
        </View>
        <View className="mt-3 flex-row justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Cliente</Text>
            <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
              {clienteLabel}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-neutral-500">Total</Text>
            <Text className="text-sm font-semibold text-neutral-900">{formatMoney(total)}</Text>
          </View>
        </View>
      </Pressable>
    )
  }

  const matchesSearch = (value: string, search: string) =>
    value.toLowerCase().includes(search.trim().toLowerCase())

  const normalizedSearch = searchText.trim().toLowerCase()

  const filteredCredits = credits.filter((credit) => {
    if (selectedClientId && credit.cliente_id !== selectedClientId) return false
    if (!normalizedSearch) return true
    const clientLabel = clientNameMap[credit.cliente_id] || credit.cliente_id || ''
    const pedidoLabel = credit.pedido_id || ''
    return (
      matchesSearch(clientLabel, normalizedSearch) ||
      matchesSearch(pedidoLabel, normalizedSearch) ||
      matchesSearch(credit.id || '', normalizedSearch)
    )
  })

  const filteredAprobados = filteredCredits.filter((credit) => {
    const estado = credit.estado ?? 'activo'
    return estado !== 'pagado' && estado !== 'cancelado'
  })
  const filteredPagados = filteredCredits.filter((credit) => (credit.estado ?? '') === 'pagado')
  const filteredRechazados = filteredCredits.filter((credit) => (credit.estado ?? '') === 'cancelado')

  const filteredPending = pendingOrders.filter((order) => {
    if (selectedClientId && order.cliente_id !== selectedClientId) return false
    if (!normalizedSearch) return true
    const clientLabel = order.cliente_id ? clientNameMap[order.cliente_id] || order.cliente_id : ''
    const pedidoLabel = order.numero_pedido || order.id
    return matchesSearch(clientLabel || '', normalizedSearch) || matchesSearch(pedidoLabel || '', normalizedSearch)
  })

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Creditos" variant="standard" rightElement={<SellerHeaderMenu />} />

      <CategoryFilter
        categories={[
          { id: 'pendientes', name: 'Pendientes' },
          { id: 'aprobados', name: 'Aprobados' },
          { id: 'pagados', name: 'Pagados' },
          { id: 'rechazados', name: 'Rechazados' },
        ]}
        selectedId={activeTab}
        onSelect={(id) => setActiveTab(id as 'pendientes' | 'aprobados' | 'pagados' | 'rechazados')}
        searchValue={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Buscar por cliente o pedido"
        actionLabel="Cliente"
        onActionPress={() => setClientModalVisible(true)}
      />

      {loading && credits.length === 0 && pendingOrders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <FlatList
          data={
            activeTab === 'pendientes'
              ? filteredPending
              : activeTab === 'pagados'
                ? filteredPagados
                : activeTab === 'rechazados'
                  ? filteredRechazados
                  : filteredAprobados
          }
          keyExtractor={(item) => item.id}
          renderItem={activeTab === 'pendientes' ? renderPendingItem : renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCredits} tintColor={BRAND_COLORS.red} />}
          ListEmptyComponent={
            <View className="items-center justify-center py-14">
              <View className="p-4 rounded-full bg-red-50 mb-4">
                <Ionicons name={activeTab === 'pendientes' ? 'card-outline' : 'cash-outline'} size={36} color={BRAND_COLORS.red} />
              </View>
              <Text className="text-lg font-bold text-neutral-900 mb-2">
                {activeTab === 'pendientes'
                  ? 'Sin solicitudes'
                  : activeTab === 'pagados'
                    ? 'Sin creditos pagados'
                    : activeTab === 'rechazados'
                      ? 'Sin creditos rechazados'
                      : 'Sin creditos'}
              </Text>
              <Text className="text-sm text-neutral-500 text-center">
                {activeTab === 'pendientes'
                  ? 'No hay pedidos a credito pendientes de aprobacion.'
                  : activeTab === 'pagados'
                    ? 'No hay creditos pagados para mostrar.'
                    : activeTab === 'rechazados'
                      ? 'No hay creditos rechazados para mostrar.'
                      : 'Todavia no tienes creditos registrados.'}
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

