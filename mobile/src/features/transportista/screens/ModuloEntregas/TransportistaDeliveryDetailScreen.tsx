import React from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { TextField } from '../../../../components/ui/TextField'
import { MiniMapPreview } from '../../../../components/ui/MiniMapPreview'
import { BRAND_COLORS } from '../../../../shared/types'
import { Delivery, DeliveryService } from '../../../../services/api/DeliveryService'
import { OrderService } from '../../../../services/api/OrderService'
import { UserClientService } from '../../../../services/api/UserClientService'
import { showGlobalToast } from '../../../../utils/toastService'

export function TransportistaDeliveryDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const entregaId = route.params?.entregaId as string | undefined

  const [loading, setLoading] = React.useState(false)
  const [delivery, setDelivery] = React.useState<Delivery | null>(null)
  const [observaciones, setObservaciones] = React.useState('')
  const [motivoNoEntrega, setMotivoNoEntrega] = React.useState('')
  const [clientPoint, setClientPoint] = React.useState<{ latitude: number; longitude: number } | null>(null)
  const [clientName, setClientName] = React.useState<string | null>(null)
  const [updating, setUpdating] = React.useState(false)

  const loadDelivery = React.useCallback(async () => {
    if (!entregaId) return
    setLoading(true)
    try {
      const data = await DeliveryService.getDelivery(entregaId)
      setDelivery(data)
      if (data?.pedido_id) {
        const order = await OrderService.getOrderDetail(data.pedido_id)
        const clienteId = order?.pedido?.cliente_id
        if (clienteId) {
          const client = await UserClientService.getClient(clienteId)
          if (client?.latitud && client?.longitud) {
            setClientPoint({ latitude: Number(client.latitud), longitude: Number(client.longitud) })
          }
          setClientName(client?.nombre_comercial || client?.ruc || null)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [entregaId])

  useFocusEffect(
    React.useCallback(() => {
      loadDelivery()
    }, [loadDelivery]),
  )

  const handleComplete = async () => {
    if (!entregaId) return
    setUpdating(true)
    try {
      const updated = await DeliveryService.completeDelivery(entregaId, {
        observaciones: observaciones.trim() || undefined,
        latitud: clientPoint?.latitude,
        longitud: clientPoint?.longitude,
      })
      if (!updated) {
        showGlobalToast('No se pudo completar la entrega', 'error')
        return
      }
      setDelivery(updated)
      showGlobalToast('Entrega completada', 'success')
    } finally {
      setUpdating(false)
    }
  }

  const handleNoDelivery = async () => {
    if (!entregaId) return
    if (!motivoNoEntrega.trim()) {
      showGlobalToast('Ingresa un motivo de no entrega', 'warning')
      return
    }
    setUpdating(true)
    try {
      const updated = await DeliveryService.markNoDelivery(entregaId, {
        motivo_no_entrega: motivoNoEntrega.trim(),
        observaciones: observaciones.trim() || undefined,
        latitud: clientPoint?.latitude,
        longitud: clientPoint?.longitude,
      })
      if (!updated) {
        showGlobalToast('No se pudo registrar la no entrega', 'error')
        return
      }
      setDelivery(updated)
      showGlobalToast('No entrega registrada', 'success')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Detalle entrega" variant="standard" onBackPress={() => navigation.goBack()} />

      {loading && !delivery ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
            <Text className="text-xs text-neutral-500">Pedido</Text>
            <Text className="text-base font-bold text-neutral-900">
              #{delivery?.pedido_id?.slice(0, 8) || '---'}
            </Text>
            <Text className="text-xs text-neutral-500 mt-1">
              Estado: {delivery?.estado?.replace(/_/g, ' ') || 'pendiente'}
            </Text>
          </View>

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <Text className="text-sm font-semibold text-neutral-700">Cliente</Text>
            <Text className="text-sm text-neutral-900 mt-2">{clientName || 'Cliente'}</Text>
            <View className="mt-3">
              {clientPoint ? (
                <MiniMapPreview center={clientPoint} marker={clientPoint} height={160} />
              ) : (
                <View className="border border-neutral-200 rounded-2xl px-4 py-4 bg-neutral-50">
                  <Text className="text-xs text-neutral-500">No hay coordenadas registradas.</Text>
                </View>
              )}
            </View>
          </View>

          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <TextField
              label="Observaciones (opcional)"
              value={observaciones}
              onChangeText={setObservaciones}
              placeholder="Notas de entrega"
            />
          </View>

          {delivery?.estado === 'pendiente' || delivery?.estado === 'en_ruta' ? (
            <View className="mt-6 gap-3">
              <PrimaryButton
                title={updating ? 'Completando...' : 'Entregado completo'}
                onPress={handleComplete}
                disabled={updating}
              />
              <View className="bg-white rounded-2xl border border-red-100 p-4">
                <TextField
                  label="Motivo no entrega"
                  value={motivoNoEntrega}
                  onChangeText={setMotivoNoEntrega}
                  placeholder="Ej: Cliente ausente"
                />
                <View className="mt-4">
                  <PrimaryButton
                    title={updating ? 'Enviando...' : 'No entregado'}
                    onPress={handleNoDelivery}
                    disabled={updating}
                  />
                </View>
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  )
}
