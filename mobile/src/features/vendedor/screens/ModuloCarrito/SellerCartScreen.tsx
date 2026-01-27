import React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { jwtDecode } from 'jwt-decode'
import { useNavigation } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { CartItemRow } from '../../../../components/ui/CartItemRow'
import { CartSummary } from '../../../../components/ui/CartSummary'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { PickerModal, PickerOption } from '../../../../components/ui/PickerModal'
import { BRAND_COLORS } from '../../../../shared/types'
import { useCart } from '../../../../context/CartContext'
import { showGlobalToast } from '../../../../utils/toastService'
import { UserClient, UserClientService } from '../../../../services/api/UserClientService'
import { getValidToken } from '../../../../services/auth/authClient'
import { useStableInsets } from '../../../../hooks/useStableInsets'

export function SellerCartScreen() {
  const navigation = useNavigation<any>()
  const cart = useCart()
  const insets = useStableInsets()
  const [clients, setClients] = React.useState<UserClient[]>([])
  const [loadingClients, setLoadingClients] = React.useState(false)
  const [clientPickerVisible, setClientPickerVisible] = React.useState(false)
  const [paymentPickerVisible, setPaymentPickerVisible] = React.useState(false)

  const loadClients = React.useCallback(async () => {
    setLoadingClients(true)
    try {
      const token = await getValidToken()
      if (!token) {
        setClients([])
        return
      }
      const decoded = jwtDecode<{ sub?: string; userId?: string }>(token)
      const vendedorId = decoded.sub || decoded.userId
      if (!vendedorId) {
        setClients([])
        return
      }
      const data = await UserClientService.getClientsByVendedor(vendedorId)
      setClients(data)
    } finally {
      setLoadingClients(false)
    }
  }, [])

  React.useEffect(() => {
    loadClients()
  }, [loadClients])

  const clientOptions: PickerOption[] = clients.map((client) => ({
    id: client.usuario_id,
    label: client.nombre_comercial,
    description: client.ruc || client.canal_nombre || client.canal_codigo || 'Cliente',
    icon: 'business',
    color: BRAND_COLORS.red,
  }))

  const paymentOptions: PickerOption[] = [
    { id: 'contado', label: 'Contado', description: 'Pago inmediato', icon: 'cash', color: '#10B981' },
    { id: 'credito', label: 'Credito', description: 'Aprobacion requerida', icon: 'card', color: '#F59E0B' },
  ]

  const handleReviewOrder = async () => {
    if (cart.items.length === 0) {
      showGlobalToast('El carrito esta vacio', 'warning')
      return
    }
    if (!cart.selectedClient) {
      showGlobalToast('Selecciona un cliente', 'warning')
      setClientPickerVisible(true)
      return
    }
    const parent = navigation.getParent?.()
    if (parent?.getState?.().routeNames?.includes('ConfirmarPedido')) {
      parent.navigate('ConfirmarPedido')
    } else {
      navigation.navigate('ConfirmarPedido')
    }
  }

  const totals = cart.getTotals()

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Carrito" variant="standard" rightElement={<SellerHeaderMenu />} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 300 + insets.bottom }}
      >
        <View className="bg-white rounded-3xl border border-neutral-100 p-5 mt-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="h-10 w-10 rounded-2xl bg-red-50 items-center justify-center mr-3">
                <Ionicons name="person-outline" size={18} color={BRAND_COLORS.red} />
              </View>
              <View>
                <Text className="text-xs text-neutral-500 font-semibold">Cliente seleccionado</Text>
                <Text className="text-base font-bold text-neutral-900" numberOfLines={1}>
                  {cart.selectedClient?.nombre_comercial ?? 'Selecciona un cliente'}
                </Text>
                <Text className="text-xs text-neutral-500">
                  {cart.selectedClient?.ruc || cart.selectedClient?.canal_nombre || 'Sin RUC'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => setClientPickerVisible(true)}
              className="px-4 py-2 rounded-xl bg-brand-red"
            >
              <Text className="text-white text-xs font-bold">
                {cart.selectedClient ? 'Cambiar' : 'Elegir'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="bg-white rounded-3xl border border-neutral-100 p-5 mt-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="h-10 w-10 rounded-2xl bg-amber-50 items-center justify-center mr-3">
                <Ionicons name="card-outline" size={18} color="#F59E0B" />
              </View>
              <View>
                <Text className="text-xs text-neutral-500 font-semibold">Metodo de pago</Text>
                <Text className="text-base font-bold text-neutral-900">
                  {cart.paymentMethod === 'credito' ? 'Credito' : 'Contado'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => setPaymentPickerVisible(true)}
              className="px-4 py-2 rounded-xl bg-brand-red"
            >
              <Text className="text-white text-xs font-bold">Cambiar</Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-6">
          <Text className="text-sm font-semibold text-neutral-700 mb-3">Productos en carrito</Text>
          {cart.items.length === 0 ? (
            <View className="items-center justify-center py-10">
              <Ionicons name="cart-outline" size={36} color="#9CA3AF" />
              <Text className="text-neutral-500 mt-3">Aun no hay productos en el carrito.</Text>
            </View>
          ) : (
            cart.items.map((item) => (
              <CartItemRow
                key={item.skuId}
                item={{
                  id: item.skuId,
                  name: `${item.productName} - ${item.skuName}`,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.image,
                  category: item.categoryName ?? 'Catalogo',
                  code: item.skuCode,
                }}
                onIncrement={() => cart.updateQuantity(item.skuId, item.quantity + 1)}
                onDecrement={() => cart.updateQuantity(item.skuId, item.quantity - 1)}
                onRemove={() => cart.removeItem(item.skuId)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <View className="absolute left-0 right-0" style={{ bottom: insets.bottom + 84 }}>
        <View className="bg-white border-t border-neutral-100 px-5 pt-4 pb-6 shadow-lg shadow-black/10 rounded-t-3xl">
          <CartSummary totalItems={cart.getItemCount()} subtotal={totals.subtotal} tax={totals.tax} />
          <View className="mt-4">
            <PrimaryButton title="Revisar pedido" onPress={handleReviewOrder} />
          </View>
        </View>
      </View>

      <PickerModal
        visible={clientPickerVisible}
        title="Selecciona un cliente"
        options={clientOptions}
        selectedId={cart.selectedClient?.usuario_id}
        onSelect={(id) => {
          const client = clients.find((item) => item.usuario_id === id) || null
          cart.setClient(client)
          setClientPickerVisible(false)
        }}
        onClose={() => setClientPickerVisible(false)}
        infoText={loadingClients ? 'Cargando clientes...' : undefined}
        infoIcon={loadingClients ? 'time-outline' : undefined}
        infoColor={loadingClients ? BRAND_COLORS.red : undefined}
      />

      <PickerModal
        visible={paymentPickerVisible}
        title="Selecciona metodo de pago"
        options={paymentOptions}
        selectedId={cart.paymentMethod}
        onSelect={(id) => {
          cart.setPaymentMethod(id as 'contado' | 'credito')
          setPaymentPickerVisible(false)
        }}
        onClose={() => setPaymentPickerVisible(false)}
      />

    </View>
  )
}
