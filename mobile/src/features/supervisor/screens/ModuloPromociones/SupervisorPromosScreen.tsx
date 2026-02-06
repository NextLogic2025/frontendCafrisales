import React from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { FeedbackModal } from '../../../../components/ui/FeedbackModal'
import { BRAND_COLORS } from '../../../../shared/types'
import { OrderListItem, OrderService } from '../../../../services/api/OrderService'
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

const getPendingItems = (order: OrderListItem) =>
  (order.items || []).filter((item) => item.requiere_aprobacion && !item.aprobado_en)

export function SupervisorPromosScreen() {
  const navigation = useNavigation<any>()
  const [orders, setOrders] = React.useState<OrderListItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [clientNameMap, setClientNameMap] = React.useState<Record<string, string>>({})
  const [approvingOrderId, setApprovingOrderId] = React.useState<string | null>(null)
  const [rejectingOrderId, setRejectingOrderId] = React.useState<string | null>(null)
  const [rejectModalVisible, setRejectModalVisible] = React.useState(false)
  const [rejectTargetId, setRejectTargetId] = React.useState<string | null>(null)

  const loadPromos = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await OrderService.getPendingPromoApprovals()
      setOrders(data)
      const uniqueClientIds = Array.from(
        new Set(data.map((order) => order.cliente_id).filter((id): id is string => typeof id === 'string' && id.length > 0)),
      )
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
      loadPromos()
    }, [loadPromos]),
  )

  const normalizedSearch = search.trim().toLowerCase()
  const filteredOrders = orders.filter((order) => {
    if (!normalizedSearch) return true
    const clientLabel = order.cliente_id ? clientNameMap[order.cliente_id] || order.cliente_id : ''
    const pedidoLabel = order.numero_pedido || order.id
    return clientLabel.toLowerCase().includes(normalizedSearch) || pedidoLabel.toLowerCase().includes(normalizedSearch)
  })

  const pendingOrders = filteredOrders.filter((order) => getPendingItems(order).length > 0)
  const pendingItemsCount = pendingOrders.reduce((sum, order) => sum + getPendingItems(order).length, 0)
  const pendingValue = pendingOrders.reduce((sum, order) => {
    const orderDelta = getPendingItems(order).reduce((acc, item) => {
      const base = Number(item.precio_unitario_base ?? 0)
      const final = Number(item.precio_unitario_final ?? base)
      const qty = Number(item.cantidad_solicitada ?? 0)
      return acc + Math.max(0, base - final) * qty
    }, 0)
    return sum + orderDelta
  }, 0)

  const handleApproveAll = async (orderId: string) => {
    setApprovingOrderId(orderId)
    try {
      const ok = await OrderService.approvePromotions(orderId, { approve_all: true })
      if (ok) {
        await loadPromos()
      }
    } finally {
      setApprovingOrderId(null)
    }
  }

  const handleRejectAll = (orderId: string) => {
    setRejectTargetId(orderId)
    setRejectModalVisible(true)
  }

  const confirmRejectAll = async () => {
    if (!rejectTargetId) return
    setRejectingOrderId(rejectTargetId)
    try {
      const ok = await OrderService.rejectPromotions(rejectTargetId, { reject_all: true })
      if (ok) {
        await loadPromos()
      }
    } finally {
      setRejectingOrderId(null)
      setRejectTargetId(null)
    }
  }

  const renderItem = ({ item }: { item: OrderListItem }) => {
    const pendingItems = getPendingItems(item)
    const clientLabel = item.cliente_id ? clientNameMap[item.cliente_id] || item.cliente_id : 'Cliente'
    const orderLabel = item.numero_pedido || item.id
    const isApproving = approvingOrderId === item.id
    const isRejecting = rejectingOrderId === item.id

    return (
      <View className="bg-white rounded-3xl border border-neutral-100 p-5 mb-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Pedido</Text>
            <Text className="text-base font-bold text-neutral-900">{orderLabel}</Text>
          </View>
          <View className="px-3 py-1 rounded-full bg-amber-50">
            <Text className="text-xs font-semibold text-amber-600">
              {pendingItems.length} pendiente{pendingItems.length === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        <View className="mt-3">
          <Text className="text-xs text-neutral-500">Cliente</Text>
          <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>{clientLabel}</Text>
        </View>

        <View className="mt-3 flex-row justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Total pedido</Text>
            <Text className="text-sm font-semibold text-neutral-900">
              {formatMoney(Number(item.total ?? 0))}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-neutral-500">Fecha</Text>
            <Text className="text-xs text-neutral-700">{formatDate(item.creado_en)}</Text>
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-xs text-neutral-500 mb-2">Items con promoción</Text>
          {pendingItems.slice(0, 3).map((promo) => {
            const base = Number(promo.precio_unitario_base ?? 0)
            const final = Number(promo.precio_unitario_final ?? base)
            const delta = Math.max(0, base - final)
            const qty = Number(promo.cantidad_solicitada ?? 0)
            const label = promo.sku_nombre_snapshot || promo.sku_codigo_snapshot || promo.sku_id
            return (
              <View key={promo.id || promo.sku_id} className="flex-row items-start justify-between py-1">
                <Text className="text-xs text-neutral-700 flex-1 pr-2" numberOfLines={2}>
                  {label}
                </Text>
                <Text className="text-xs font-semibold text-amber-700 text-right">
                  -{formatMoney(delta * qty)}
                </Text>
              </View>
            )
          })}
          {pendingItems.length > 3 && (
            <Text className="text-xs text-neutral-500 mt-1">+{pendingItems.length - 3} items más</Text>
          )}
        </View>

        <View className="mt-4 flex-row gap-3">
          <PrimaryButton
            title={isApproving ? 'Aprobando...' : 'Aprobar todo'}
            onPress={() => handleApproveAll(item.id)}
            loading={isApproving}
            style={{ flex: 1 }}
          />
          <Pressable
            onPress={() => handleRejectAll(item.id)}
            disabled={isRejecting}
            className={`flex-1 rounded-2xl border items-center justify-center ${isRejecting ? 'opacity-60 border-red-200 bg-red-50' : 'border-red-200 bg-red-50'
              }`}
          >
            <Text className="text-sm font-semibold text-red-700">
              {isRejecting ? 'Rechazando...' : 'Rechazar'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('SupervisorPedidoDetalle', { orderId: item.id })}
            className="flex-1 rounded-2xl border border-neutral-200 items-center justify-center"
          >
            <Text className="text-sm font-semibold text-neutral-700">Ver pedido</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Promociones" variant="standard" rightElement={<SupervisorHeaderMenu />} />

      <View className="px-5 pt-4">
        <LinearGradient
          colors={['#FEF3C7', '#FFF7ED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#FDE68A' }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-amber-700 font-semibold">Aprobaciones pendientes</Text>
              <Text className="text-2xl font-extrabold text-amber-900">{pendingItemsCount}</Text>
              <Text className="text-xs text-amber-700 mt-1">
                {pendingOrders.length} pedido{pendingOrders.length === 1 ? '' : 's'}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-amber-700">Descuento total</Text>
              <Text className="text-lg font-bold text-amber-900">{formatMoney(pendingValue)}</Text>
            </View>
          </View>
        </LinearGradient>

        <View className="mt-4">
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch('')}
            placeholder="Buscar por cliente o pedido"
          />
        </View>
      </View>

      {loading && orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <FlatList
          data={pendingOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPromos} tintColor={BRAND_COLORS.red} />}
          ListEmptyComponent={
            <View className="items-center justify-center py-14">
              <View className="p-4 rounded-full bg-amber-50 mb-4">
                <Ionicons name="sparkles-outline" size={36} color="#F59E0B" />
              </View>
              <Text className="text-lg font-bold text-neutral-900 mb-2">Sin promociones pendientes</Text>
              <Text className="text-sm text-neutral-500 text-center">
                No hay pedidos con promociones que requieran aprobación.
              </Text>
            </View>
          }
        />
      )}

      <FeedbackModal
        visible={rejectModalVisible}
        type="warning"
        title="Rechazar promociones"
        message="Esto quitará los descuentos y volverá a precios catálogo. Se reflejará en el detalle del pedido."
        confirmText={rejectingOrderId ? 'Rechazando...' : 'Rechazar'}
        cancelText="Cancelar"
        showCancel
        onClose={() => {
          if (!rejectingOrderId) {
            setRejectModalVisible(false)
            setRejectTargetId(null)
          }
        }}
        onConfirm={confirmRejectAll}
      />
    </View>
  )
}
