import React from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { CartSummary } from '../../../../components/ui/CartSummary'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { TextField } from '../../../../components/ui/TextField'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { DatePickerModal } from '../../../../components/ui/DatePickerModal'
import { useCart } from '../../../../context/CartContext'
import { showGlobalToast } from '../../../../utils/toastService'
import { isUuid } from '../../../../utils/validators'
import { OrderService } from '../../../../services/api/OrderService'
import { CreditService } from '../../../../services/api/CreditService'
import { UserClientService } from '../../../../services/api/UserClientService'
import { useStableInsets } from '../../../../hooks/useStableInsets'

export function SellerOrderReviewScreen() {
  const navigation = useNavigation<any>()
  const cart = useCart()
  const insets = useStableInsets()
  const [submitting, setSubmitting] = React.useState(false)
  const [checked, setChecked] = React.useState(false)
  const [creditModalVisible, setCreditModalVisible] = React.useState(false)
  const [creditPlazo, setCreditPlazo] = React.useState('30')
  const [creditNotas, setCreditNotas] = React.useState('')
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
  const [discountModalVisible, setDiscountModalVisible] = React.useState(false)
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null)
  const [discountType, setDiscountType] = React.useState<'porcentaje' | 'monto_fijo'>('porcentaje')
  const [discountValue, setDiscountValue] = React.useState('')
  const [discountRequiresApproval, setDiscountRequiresApproval] = React.useState(false)
  const [orderDiscountModalVisible, setOrderDiscountModalVisible] = React.useState(false)
  const [orderDiscountType, setOrderDiscountType] = React.useState<'porcentaje' | 'monto_fijo'>('porcentaje')
  const [orderDiscountValue, setOrderDiscountValue] = React.useState('')
  const [clientConditions, setClientConditions] = React.useState<{
    permite_negociacion?: boolean | null
    max_descuento_porcentaje?: number | null
    requiere_aprobacion_supervisor?: boolean | null
  } | null>(null)
  const [loadingConditions, setLoadingConditions] = React.useState(false)

  const totals = cart.getTotals()
  const subtotal = totals.subtotal
  const parsedOrderDiscount = Number(orderDiscountValue)
  const orderDiscountIsValid = Number.isFinite(parsedOrderDiscount) && parsedOrderDiscount > 0
  const hasItemDiscounts = cart.items.some((item) => item.discountType && item.discountValue)
  const orderDiscountAmount =
    orderDiscountIsValid
      ? orderDiscountType === 'porcentaje'
        ? Number(((subtotal * parsedOrderDiscount) / 100).toFixed(2))
        : Number(Math.min(subtotal, parsedOrderDiscount).toFixed(2))
      : 0
  const discountedBase = Number(Math.max(0, subtotal - orderDiscountAmount).toFixed(2))
  const discountTax = Number((discountedBase * 0.15).toFixed(2))

  React.useEffect(() => {
    const clientId = cart.selectedClient?.usuario_id
    if (!clientId) {
      setClientConditions(null)
      return
    }
    let active = true
    setLoadingConditions(true)
    UserClientService.getClientConditions(clientId)
      .then((data) => {
        if (active) setClientConditions(data)
      })
      .finally(() => {
        if (active) setLoadingConditions(false)
      })
    return () => {
      active = false
    }
  }, [cart.selectedClient?.usuario_id])

  const submitOrder = async () => {
    if (!cart.selectedClient) {
      showGlobalToast('Selecciona un cliente', 'warning')
      navigation.navigate('SellerTabs', { screen: 'Carrito' })
      return
    }
    if (cart.items.length === 0) {
      showGlobalToast('El carrito esta vacio', 'warning')
      navigation.navigate('SellerTabs', { screen: 'Carrito' })
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
    if (orderDiscountAmount > 0 && hasItemDiscounts) {
      showGlobalToast('No se permite descuento por item y pedido al mismo tiempo', 'warning')
      return
    }
    if (orderDiscountAmount > 0) {
      if (orderDiscountType === 'porcentaje' && parsedOrderDiscount > 100) {
        showGlobalToast('El porcentaje no puede ser mayor a 100%', 'warning')
        return
      }
      if (orderDiscountType === 'monto_fijo' && parsedOrderDiscount > subtotal) {
        showGlobalToast('El descuento no puede ser mayor al subtotal', 'warning')
        return
      }
    }

    setSubmitting(true)
    try {
      const payload = {
        cliente_id: cart.selectedClient.usuario_id,
        zona_id: cart.selectedClient.zona_id,
        metodo_pago: cart.paymentMethod,
        fecha_entrega_sugerida: deliveryDate,
        descuento_pedido_tipo: orderDiscountAmount > 0 ? orderDiscountType : undefined,
        descuento_pedido_valor: orderDiscountAmount > 0 ? parsedOrderDiscount : undefined,
        items: cart.items.map((item) => ({
          sku_id: item.skuId,
          cantidad: item.quantity,
          descuento_item_tipo: item.discountType,
          descuento_item_valor: item.discountValue,
          requiere_aprobacion: item.requiresApproval,
          origen_precio: (item.discountType ? 'negociado' : 'catalogo') as 'catalogo' | 'negociado',
        })),
      }

      const order = await OrderService.createOrder(payload)
      if (!order) {
        showGlobalToast('No se pudo crear el pedido', 'error')
        return
      }

      if (cart.paymentMethod === 'credito') {
        const plazo = Number(creditPlazo)
        const credit = await CreditService.approveCredit({
          pedido_id: order.id,
          cliente_id: cart.selectedClient.usuario_id,
          monto_aprobado: totals.total,
          plazo_dias: Number.isFinite(plazo) ? plazo : 30,
          notas: creditNotas || undefined,
        })
        if (!credit) {
          showGlobalToast('Pedido creado, pero no se pudo aprobar el credito', 'warning')
        } else {
          showGlobalToast('Credito aprobado correctamente', 'success')
        }
      }

      cart.clear()
      setCreditNotas('')
      setCreditPlazo('30')
      setOrderDiscountValue('')
      setOrderDiscountType('porcentaje')
      showGlobalToast('Pedido creado correctamente', 'success')
      navigation.navigate('SellerTabs', { screen: 'Carrito' })
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

  const openDiscountModal = (itemId: string) => {
    if (loadingConditions) {
      showGlobalToast('Cargando condiciones del cliente...', 'warning')
      return
    }
    if (orderDiscountAmount > 0) {
      showGlobalToast('No se permite descuento por item y pedido al mismo tiempo', 'warning')
      return
    }
    const item = cart.items.find((entry) => entry.skuId === itemId)
    setSelectedItemId(itemId)
    setDiscountType(item?.discountType ?? 'porcentaje')
    setDiscountValue(item?.discountValue != null ? String(item.discountValue) : '')
    setDiscountRequiresApproval(item?.requiresApproval ?? clientConditions?.requiere_aprobacion_supervisor ?? false)
    setDiscountModalVisible(true)
  }

  const applyDiscount = () => {
    if (!selectedItemId) {
      setDiscountModalVisible(false)
      return
    }
    const value = Number(discountValue)
    if (!Number.isFinite(value) || value <= 0) {
      cart.updateItemDiscount(selectedItemId, {
        discountType: undefined,
        discountValue: undefined,
        priceOrigin: 'catalogo',
        requiresApproval: false,
      })
      setDiscountModalVisible(false)
      return
    }

    if (
      discountType === 'porcentaje' &&
      clientConditions?.max_descuento_porcentaje != null &&
      value > clientConditions.max_descuento_porcentaje
    ) {
      showGlobalToast(`El descuento maximo permitido es ${clientConditions.max_descuento_porcentaje}%`, 'warning')
      return
    }

    cart.updateItemDiscount(selectedItemId, {
      discountType,
      discountValue: value,
      priceOrigin: 'negociado',
      requiresApproval: discountRequiresApproval,
    })
    setDiscountModalVisible(false)
  }

  const applyOrderDiscount = () => {
    const value = Number(orderDiscountValue)
    if (!Number.isFinite(value) || value <= 0) {
      setOrderDiscountValue('')
      setOrderDiscountModalVisible(false)
      return
    }
    if (hasItemDiscounts) {
      showGlobalToast('Quita los descuentos por item para aplicar descuento al pedido', 'warning')
      return
    }
    if (orderDiscountType === 'porcentaje' && value > 100) {
      showGlobalToast('El porcentaje no puede ser mayor a 100%', 'warning')
      return
    }
    if (orderDiscountType === 'monto_fijo' && value > subtotal) {
      showGlobalToast('El descuento no puede ser mayor al subtotal', 'warning')
      return
    }
    setOrderDiscountModalVisible(false)
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Confirmar pedido"
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SellerHeaderMenu />}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 + insets.bottom }}
      >
        <View className="bg-white rounded-3xl border border-neutral-100 p-5 mt-4 shadow-sm">
          <Text className="text-xs text-neutral-500 font-semibold">Cliente</Text>
          <Text className="text-base font-bold text-neutral-900 mt-1">
            {cart.selectedClient?.nombre_comercial ?? 'Sin cliente'}
          </Text>
          <Text className="text-xs text-neutral-500 mt-1">
            {cart.selectedClient?.ruc || cart.selectedClient?.canal_nombre || 'Cliente sin RUC'}
          </Text>
        </View>

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
              const unitPrice = cart.getItemUnitPrice(item.skuId)
              const lineTotal = unitPrice * item.quantity
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
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-xs text-neutral-500">
                      Precio unitario: ${unitPrice.toFixed(2)}
                    </Text>
                    <Pressable
                      onPress={() => openDiscountModal(item.skuId)}
                      className="px-3 py-1 rounded-full bg-red-50"
                    >
                      <Text className="text-xs font-semibold text-brand-red">
                        {item.discountType ? 'Editar descuento' : 'Agregar descuento'}
                      </Text>
                    </Pressable>
                  </View>
                  {item.discountType && item.discountValue != null ? (
                    <Text className="text-xs text-amber-600 mt-2">
                      Descuento aplicado: {item.discountType === 'porcentaje'
                        ? `${item.discountValue}%`
                        : `-$${item.discountValue.toFixed(2)}`} {item.requiresApproval ? '- Requiere aprobacion' : ''}
                    </Text>
                  ) : null}
                </View>
              )
            })}
          </View>
        </View>

        <View className="bg-white rounded-3xl border border-neutral-100 p-4 mt-6 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-neutral-500">Descuento del pedido</Text>
              {orderDiscountAmount > 0 ? (
                <Text className="text-sm font-semibold text-amber-600 mt-1">
                  {orderDiscountType === 'porcentaje'
                    ? `${parsedOrderDiscount}%`
                    : `-$${parsedOrderDiscount.toFixed(2)}`} · -${orderDiscountAmount.toFixed(2)}
                </Text>
              ) : (
                <Text className="text-sm text-neutral-500 mt-1">Sin descuento aplicado</Text>
              )}
            </View>
            <Pressable
              onPress={() => setOrderDiscountModalVisible(true)}
              className="px-3 py-1 rounded-full bg-amber-50"
            >
              <Text className="text-xs font-semibold text-amber-700">
                {orderDiscountAmount > 0 ? 'Editar' : 'Agregar'}
              </Text>
            </Pressable>
          </View>
          {hasItemDiscounts ? (
            <Text className="text-[11px] text-amber-700 mt-2">
              No se permite descuento por item y pedido al mismo tiempo.
            </Text>
          ) : null}
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
            Confirmo que revisé cantidades, precios y cliente del pedido.
          </Text>
        </Pressable>

        <View className="bg-white rounded-3xl border border-neutral-100 p-4 mt-6 shadow-sm">
          <CartSummary
            totalItems={cart.getItemCount()}
            subtotal={subtotal}
            discount={orderDiscountAmount}
            tax={discountTax}
          />
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
        title="Aprobar credito"
        onClose={() => setCreditModalVisible(false)}
      >
        <View className="gap-4">
          <Text className="text-sm text-neutral-600">
            El credito se aprobara despues de crear el pedido.
          </Text>
          <TextField
            label="Plazo en dias"
            keyboardType="numeric"
            value={creditPlazo}
            onChangeText={setCreditPlazo}
            placeholder="30"
          />
          <TextField
            label="Notas"
            value={creditNotas}
            onChangeText={setCreditNotas}
            placeholder="Observaciones"
          />
          <PrimaryButton
            title={submitting ? 'Aprobando...' : 'Confirmar credito'}
            onPress={submitOrder}
            disabled={submitting}
          />
        </View>
      </GenericModal>

      <GenericModal
        visible={discountModalVisible}
        title="Descuento por item"
        onClose={() => setDiscountModalVisible(false)}
      >
        <View className="gap-4">
          <Text className="text-sm text-neutral-600">
            Selecciona el tipo de descuento y el valor a aplicar.
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setDiscountType('porcentaje')}
              className={`flex-1 rounded-xl px-4 py-2 border ${
                discountType === 'porcentaje' ? 'bg-red-50 border-red-200' : 'border-neutral-200'
              }`}
            >
              <Text className={`text-center text-sm font-semibold ${
                discountType === 'porcentaje' ? 'text-brand-red' : 'text-neutral-700'
              }`}>Porcentaje</Text>
            </Pressable>
            <Pressable
              onPress={() => setDiscountType('monto_fijo')}
              className={`flex-1 rounded-xl px-4 py-2 border ${
                discountType === 'monto_fijo' ? 'bg-red-50 border-red-200' : 'border-neutral-200'
              }`}
            >
              <Text className={`text-center text-sm font-semibold ${
                discountType === 'monto_fijo' ? 'text-brand-red' : 'text-neutral-700'
              }`}>Monto fijo</Text>
            </Pressable>
          </View>
          <TextField
            label={discountType === 'porcentaje' ? 'Valor (%)' : 'Valor ($)'}
            keyboardType="numeric"
            value={discountValue}
            onChangeText={setDiscountValue}
            placeholder={discountType === 'porcentaje' ? '10' : '2.50'}
          />
          <Pressable
            onPress={() => setDiscountRequiresApproval((prev) => !prev)}
            className="flex-row items-center"
          >
            <View
              className={`h-5 w-5 rounded-md border mr-3 items-center justify-center ${
                discountRequiresApproval ? 'bg-brand-red border-brand-red' : 'border-neutral-300'
              }`}
            >
              {discountRequiresApproval && <Ionicons name="checkmark" size={14} color="white" />}
            </View>
            <Text className="text-sm text-neutral-700">Requiere aprobacion</Text>
          </Pressable>
          <PrimaryButton title="Guardar descuento" onPress={applyDiscount} />
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

      <GenericModal
        visible={orderDiscountModalVisible}
        title="Descuento del pedido"
        onClose={() => setOrderDiscountModalVisible(false)}
      >
        <View className="gap-4">
          <Text className="text-sm text-neutral-600">
            Aplica un descuento general al pedido completo.
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setOrderDiscountType('porcentaje')}
              className={`flex-1 rounded-xl px-4 py-2 border ${
                orderDiscountType === 'porcentaje' ? 'bg-amber-50 border-amber-200' : 'border-neutral-200'
              }`}
            >
              <Text className={`text-center text-sm font-semibold ${
                orderDiscountType === 'porcentaje' ? 'text-amber-700' : 'text-neutral-700'
              }`}>Porcentaje</Text>
            </Pressable>
            <Pressable
              onPress={() => setOrderDiscountType('monto_fijo')}
              className={`flex-1 rounded-xl px-4 py-2 border ${
                orderDiscountType === 'monto_fijo' ? 'bg-amber-50 border-amber-200' : 'border-neutral-200'
              }`}
            >
              <Text className={`text-center text-sm font-semibold ${
                orderDiscountType === 'monto_fijo' ? 'text-amber-700' : 'text-neutral-700'
              }`}>Monto fijo</Text>
            </Pressable>
          </View>
          <TextField
            label={orderDiscountType === 'porcentaje' ? 'Valor (%)' : 'Valor ($)'}
            keyboardType="numeric"
            value={orderDiscountValue}
            onChangeText={setOrderDiscountValue}
            placeholder={orderDiscountType === 'porcentaje' ? '5' : '10.00'}
          />
          <PrimaryButton title="Guardar descuento" onPress={applyOrderDiscount} />
        </View>
      </GenericModal>
    </View>
  )
}
