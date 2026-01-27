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
import { useCart } from '../../../../context/CartContext'
import { showGlobalToast } from '../../../../utils/toastService'
import { OrderService } from '../../../../services/api/OrderService'
import { CreditService } from '../../../../services/api/CreditService'
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

  const totals = cart.getTotals()

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

    setSubmitting(true)
    try {
      const payload = {
        cliente_id: cart.selectedClient.usuario_id,
        zona_id: cart.selectedClient.zona_id,
        metodo_pago: cart.paymentMethod,
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
            Confirmo que revisé cantidades, precios y cliente del pedido.
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
    </View>
  )
}
