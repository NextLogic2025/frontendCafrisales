import React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { CartSummary } from '../../../../components/ui/CartSummary'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { DatePickerModal } from '../../../../components/ui/DatePickerModal'
import { useCart } from '../../../../context/CartContext'
import { showGlobalToast } from '../../../../utils/toastService'
import { isUuid } from '../../../../utils/validators'
import { OrderService } from '../../../../services/api/OrderService'
import { useStableInsets } from '../../../../hooks/useStableInsets'

export function ClientOrderReviewScreen() {
  const navigation = useNavigation<any>()
  const cart = useCart()
  const insets = useStableInsets()
  const [submitting, setSubmitting] = React.useState(false)
  const [checked, setChecked] = React.useState(false)
  const [creditModalVisible, setCreditModalVisible] = React.useState(false)
  const [datePickerVisible, setDatePickerVisible] = React.useState(false)
  const [deliveryDate, setDeliveryDate] = React.useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const day = String(tomorrow.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  const formatDeliveryDate = (value?: string) => {
    if (!value) return 'Seleccionar fecha'
    const [year, month, day] = value.split('-')
    if (!year || !month || !day) return 'Seleccionar fecha'
    return `${day}/${month}/${year}`
  }

  const totals = cart.getTotals()

  const submitOrder = async () => {
    if (cart.items.length === 0) {
      showGlobalToast('El carrito esta vacio', 'warning')
      navigation.navigate('ClienteTabs', { screen: 'Carrito' })
      return
    }
    if (!checked) {
      showGlobalToast('Confirma que revisaste el pedido', 'warning')
      return
    }
    const invalidItem = cart.items.find((item) => !isUuid(item.skuId))
    if (invalidItem) {
      showGlobalToast(`SKU invalido en carrito: ${invalidItem.skuCode || invalidItem.skuName}`, 'warning')
      return
    }
    if (!deliveryDate) {
      showGlobalToast('Selecciona una fecha de entrega', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        metodo_pago: cart.paymentMethod,
        fecha_entrega_sugerida: deliveryDate,
        items: cart.items.map((item) => ({
          sku_id: item.skuId,
          cantidad: item.quantity,
        })),
      }

      const order = await OrderService.createOrder(payload)
      if (!order) {
        showGlobalToast('No se pudo crear el pedido', 'error')
        return
      }

      if (cart.paymentMethod === 'credito') {
        showGlobalToast('Pedido creado. Credito pendiente de aprobacion.', 'info')
      }

      cart.clear()
      showGlobalToast('Pedido creado correctamente', 'success')
      navigation.navigate('ClienteTabs', { screen: 'Carrito' })
    } finally {
      setSubmitting(false)
      setCreditModalVisible(false)
    }
  }

  const handleConfirmPress = () => {
    if (cart.paymentMethod === 'credito') {
      setCreditModalVisible(true)
      return
    }
    submitOrder()
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Confirmar pedido" variant="standard" onBackPress={() => navigation.goBack()} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 + insets.bottom }}>
        <View className="bg-white rounded-3xl border border-neutral-100 p-5 mt-4 shadow-sm">
          <Text className="text-xs text-neutral-500 font-semibold">Metodo de pago</Text>
          <Text className="text-base font-bold text-neutral-900 mt-1">
            {cart.paymentMethod === 'credito' ? 'Credito' : 'Contado'}
          </Text>
          <Text className="text-xs text-neutral-500 mt-1">No se puede editar en esta pantalla.</Text>
        </View>

        <Pressable
          onPress={() => setDatePickerVisible(true)}
          className="bg-white rounded-3xl border border-neutral-100 p-5 mt-4 shadow-sm"
        >
          <Text className="text-xs text-neutral-500 font-semibold">Fecha de entrega sugerida</Text>
          <Text className="text-base font-bold text-neutral-900 mt-1">
            {formatDeliveryDate(deliveryDate)}
          </Text>
          <Text className="text-xs text-neutral-500 mt-1">Toca para cambiar.</Text>
        </Pressable>

        <View className="mt-6">
          <Text className="text-sm font-semibold text-neutral-700 mb-3">Detalle del pedido</Text>
          <View className="bg-white rounded-3xl border border-neutral-100 p-4 shadow-sm">
            {cart.items.map((item, index) => {
              const lineTotal = item.price * item.quantity
              return (
                <View key={item.skuId} className={`${index > 0 ? 'mt-4 pt-4 border-t border-neutral-100' : ''}`}>
                  <Text className="text-xs text-neutral-500">{item.skuCode}</Text>
                  <Text className="text-base font-semibold text-neutral-900" numberOfLines={2}>
                    {item.productName} - {item.skuName}
                  </Text>
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-sm text-neutral-600">Cantidad: {item.quantity}</Text>
                    <Text className="text-sm font-semibold text-neutral-900">${lineTotal.toFixed(2)}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        <Pressable
          onPress={() => setChecked((prev) => !prev)}
          className="mt-6 flex-row items-start bg-white border border-neutral-100 rounded-2xl px-4 py-4"
        >
          <View
            className={`h-5 w-5 rounded-md border mr-3 items-center justify-center mt-0.5 ${
              checked ? 'bg-brand-red border-brand-red' : 'border-neutral-300'
            }`}
          >
            {checked && <Ionicons name="checkmark" size={14} color="white" />}
          </View>
          <Text className="text-sm text-neutral-700">
            Confirmo que revisé cantidades y precios del pedido.
          </Text>
        </Pressable>

        <View className="bg-white rounded-3xl border border-neutral-100 p-4 mt-6 shadow-sm">
          <CartSummary totalItems={cart.getItemCount()} subtotal={totals.subtotal} tax={totals.tax} />
          <View className="mt-4">
            <PrimaryButton
              title={submitting ? 'Confirmando...' : 'Confirmar pedido'}
              onPress={handleConfirmPress}
              disabled={submitting}
            />
          </View>
        </View>
      </ScrollView>

      <GenericModal
        visible={creditModalVisible}
        title="Pago a credito"
        onClose={() => setCreditModalVisible(false)}
      >
        <View className="gap-4">
          <Text className="text-sm text-neutral-600">
            El pedido se creara y quedara pendiente de aprobacion por un vendedor o supervisor.
          </Text>
          <PrimaryButton
            title={submitting ? 'Creando pedido...' : 'Crear pedido a credito'}
            onPress={submitOrder}
            disabled={submitting}
          />
        </View>
      </GenericModal>

      <DatePickerModal
        visible={datePickerVisible}
        title="Fecha de entrega"
        infoText="Elige la fecha sugerida para la entrega."
        initialDate={deliveryDate}
        onSelectDate={setDeliveryDate}
        onClose={() => setDatePickerVisible(false)}
      />
    </View>
  )
}
