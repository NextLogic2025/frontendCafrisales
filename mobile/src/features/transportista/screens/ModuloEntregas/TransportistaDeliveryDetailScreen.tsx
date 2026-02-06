import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { TextField } from '../../../../components/ui/TextField'
import { MiniMapPreview } from '../../../../components/ui/MiniMapPreview'
import { AddEvidenceModal } from '../../../../components/delivery/AddEvidenceModal'
import { ReportIncidentModal } from '../../../../components/delivery/ReportIncidentModal'
import { EvidenceGalleryModal } from '../../../../components/delivery/EvidenceGalleryModal'
import { IncidentListModal } from '../../../../components/delivery/IncidentListModal'
import { BRAND_COLORS } from '../../../../shared/types'
import {
  DeliveryDetail,
  DeliveryEvidence,
  DeliveryIncident,
  DeliveryService,
} from '../../../../services/api/DeliveryService'
import { OrderService } from '../../../../services/api/OrderService'
import { UserClientService } from '../../../../services/api/UserClientService'
import { showGlobalToast } from '../../../../utils/toastService'

const getStatusBadge = (estado: string) => {
  switch (estado) {
    case 'pendiente':
      return { bg: '#E5E7EB', text: '#4B5563', label: 'Pendiente' }
    case 'en_ruta':
      return { bg: '#FEF3C7', text: '#92400E', label: 'En ruta' }
    case 'entregado_completo':
      return { bg: '#DCFCE7', text: '#166534', label: 'Entregado' }
    case 'entregado_parcial':
      return { bg: '#FEF3C7', text: '#92400E', label: 'Parcial' }
    case 'no_entregado':
      return { bg: '#FEE2E2', text: '#991B1B', label: 'No entregado' }
    case 'cancelado':
      return { bg: '#FEE2E2', text: '#991B1B', label: 'Cancelado' }
    default:
      return { bg: '#E5E7EB', text: '#4B5563', label: estado }
  }
}

export function TransportistaDeliveryDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const entregaId = route.params?.entregaId as string | undefined

  const [loading, setLoading] = React.useState(false)
  const [delivery, setDelivery] = React.useState<DeliveryDetail | null>(null)
  const [observaciones, setObservaciones] = React.useState('')
  const [motivoNoEntrega, setMotivoNoEntrega] = React.useState('')
  const [clientPoint, setClientPoint] = React.useState<{ latitude: number; longitude: number } | null>(null)
  const [clientName, setClientName] = React.useState<string | null>(null)
  const [clientAddress, setClientAddress] = React.useState<string | null>(null)
  const [orderNumber, setOrderNumber] = React.useState<string | null>(null)
  const [updating, setUpdating] = React.useState(false)

  // Modal states
  const [showAddEvidence, setShowAddEvidence] = React.useState(false)
  const [showReportIncident, setShowReportIncident] = React.useState(false)
  const [showEvidenceGallery, setShowEvidenceGallery] = React.useState(false)
  const [showIncidentList, setShowIncidentList] = React.useState(false)

  const loadDelivery = React.useCallback(async () => {
    if (!entregaId) return
    setLoading(true)
    try {
      const data = await DeliveryService.getDeliveryDetail(entregaId)
      setDelivery(data)
      if (data?.pedido_id) {
        const order = await OrderService.getOrderDetail(data.pedido_id)
        setOrderNumber(order?.pedido?.numero_pedido || data.pedido_id.slice(0, 8))
        const clienteId = order?.pedido?.cliente_id
        if (clienteId) {
          const client = await UserClientService.getClient(clienteId)
          if (client?.latitud && client?.longitud) {
            setClientPoint({ latitude: Number(client.latitud), longitude: Number(client.longitud) })
          }
          setClientName(client?.nombre_comercial || client?.ruc || null)
          setClientAddress(client?.direccion || null)
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
      setDelivery((prev) => (prev ? { ...prev, ...updated } : null))
      showGlobalToast('Entrega completada', 'success')
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkEnRuta = async () => {
    if (!entregaId) return
    setUpdating(true)
    try {
      const updated = await DeliveryService.markEnRuta(entregaId)
      if (!updated) {
        showGlobalToast('No se pudo iniciar la ruta', 'error')
        return
      }
      setDelivery((prev) => (prev ? { ...prev, ...updated } : null))
      showGlobalToast('¡Ruta iniciada!', 'success')
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
      setDelivery((prev) => (prev ? { ...prev, ...updated } : null))
      showGlobalToast('No entrega registrada', 'success')
    } finally {
      setUpdating(false)
    }
  }

  const handleEvidenceAdded = (evidence: DeliveryEvidence) => {
    setDelivery((prev) => {
      if (!prev) return null
      return {
        ...prev,
        evidencias: [...(prev.evidencias || []), evidence],
      }
    })
  }

  const handleIncidentReported = (incident: DeliveryIncident) => {
    setDelivery((prev) => {
      if (!prev) return null
      return {
        ...prev,
        incidencias: [...(prev.incidencias || []), incident],
      }
    })
  }

  const estado = delivery?.estado || 'pendiente'
  const statusBadge = getStatusBadge(estado)
  const evidencias = delivery?.evidencias || []
  const incidencias = delivery?.incidencias || []
  const canUpdate = estado === 'pendiente' || estado === 'en_ruta'
  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Detalle entrega" variant="standard" onBackPress={() => navigation.goBack()} />

      {loading && !delivery ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
          {/* Header Card */}
          <View className="rounded-3xl p-5 mb-5" style={{ backgroundColor: BRAND_COLORS.red }}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-slate-100">Entrega</Text>
                <Text className="text-xl font-bold text-white mt-1">
                  #{delivery?.id?.slice(0, 8) || '---'}
                </Text>
              </View>
              <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: statusBadge.bg }}>
                <Text className="text-xs font-bold" style={{ color: statusBadge.text }}>
                  {statusBadge.label}
                </Text>
              </View>
            </View>
            <View className="mt-4">
              <Text className="text-xs text-slate-100">Pedido</Text>
              <Text className="text-sm font-semibold text-white">
                {orderNumber || delivery?.pedido_id?.slice(0, 8) || '---'}
              </Text>
            </View>
          </View>

          {/* Cliente Info */}
          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center mr-3">
                <Ionicons name="person-outline" size={20} color={BRAND_COLORS.red} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-neutral-900">
                  {clientName || 'Cliente'}
                </Text>
                {clientAddress ? (
                  <Text className="text-xs text-neutral-500 mt-0.5">{clientAddress}</Text>
                ) : null}
              </View>
            </View>
            <View className="mt-2">
              {clientPoint ? (
                <MiniMapPreview center={clientPoint} marker={clientPoint} height={160} />
              ) : (
                <View className="border border-neutral-200 rounded-2xl px-4 py-6 bg-neutral-50 items-center">
                  <Ionicons name="location-outline" size={24} color="#9CA3AF" />
                  <Text className="text-xs text-neutral-500 mt-2">
                    No hay coordenadas registradas.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View className="flex-row gap-3 mt-4">
            <Pressable
              onPress={() => setShowEvidenceGallery(true)}
              className="flex-1 bg-white rounded-2xl border border-neutral-100 p-4 items-center"
            >
              <View className="flex-row items-center">
                <Ionicons name="images-outline" size={20} color={BRAND_COLORS.red} />
                <Text className="ml-2 text-sm font-semibold text-neutral-700">Evidencias</Text>
              </View>
              <View className="mt-2 px-2.5 py-1 rounded-full bg-neutral-100">
                <Text className="text-xs font-bold text-neutral-600">{evidencias.length}</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setShowIncidentList(true)}
              className="flex-1 bg-white rounded-2xl border border-neutral-100 p-4 items-center"
            >
              <View className="flex-row items-center">
                <Ionicons name="alert-circle-outline" size={20} color="#C2410C" />
                <Text className="ml-2 text-sm font-semibold text-neutral-700">Incidencias</Text>
              </View>
              <View className="mt-2 px-2.5 py-1 rounded-full bg-neutral-100">
                <Text className="text-xs font-bold text-neutral-600">{incidencias.length}</Text>
              </View>
            </Pressable>
          </View>

          {/* Add Actions */}
          {canUpdate ? (
            <View className="flex-row gap-3 mt-4">
              <Pressable
                onPress={() => setShowAddEvidence(true)}
                className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 py-3 items-center"
              >
                <View className="flex-row items-center">
                  <Ionicons name="camera-outline" size={18} color="#166534" />
                  <Text className="ml-2 text-sm font-semibold text-emerald-700">
                    Agregar evidencia
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setShowReportIncident(true)}
                className="flex-1 rounded-2xl border border-amber-200 bg-amber-50 py-3 items-center"
              >
                <View className="flex-row items-center">
                  <Ionicons name="warning-outline" size={18} color="#92400E" />
                  <Text className="ml-2 text-sm font-semibold text-amber-700">
                    Reportar incidencia
                  </Text>
                </View>
              </Pressable>
            </View>
          ) : null}

          {/* Observaciones */}
          <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
            <TextField
              label="Observaciones (opcional)"
              value={observaciones}
              onChangeText={setObservaciones}
              placeholder="Notas de entrega"
              editable={canUpdate}
            />
          </View>

          {/* Delivery Actions */}
          {estado === 'pendiente' ? (
            <View className="mt-6">
              <Pressable
                onPress={handleMarkEnRuta}
                disabled={updating}
                className="rounded-2xl py-4 items-center flex-row justify-center"
                style={{ backgroundColor: BRAND_COLORS.red }}
              >
                <Ionicons name="navigate" size={20} color="white" />
                <Text className="ml-2 text-base font-bold text-white">
                  {updating ? 'Iniciando...' : 'Iniciar Ruta'}
                </Text>
              </Pressable>
              <Text className="text-xs text-neutral-500 text-center mt-2">
                Presiona para indicar que estás en camino al cliente
              </Text>
            </View>
          ) : estado === 'en_ruta' ? (
            <View className="mt-6 gap-4">
              <PrimaryButton
                title={updating ? 'Completando...' : 'Marcar como entregado'}
                onPress={handleComplete}
                disabled={updating}
                loading={updating}
              />

              <View className="bg-white rounded-2xl border border-red-100 p-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="close-circle-outline" size={20} color="#991B1B" />
                  <Text className="ml-2 text-sm font-semibold text-red-800">
                    Marcar como no entregado
                  </Text>
                </View>
                <TextField
                  label="Motivo de no entrega"
                  value={motivoNoEntrega}
                  onChangeText={setMotivoNoEntrega}
                  placeholder="Ej: Cliente ausente, direccion incorrecta..."
                />
                <View className="mt-4">
                  <Pressable
                    onPress={handleNoDelivery}
                    disabled={updating || !motivoNoEntrega.trim()}
                    className={`rounded-2xl py-3 items-center border ${motivoNoEntrega.trim()
                        ? 'border-red-300 bg-red-50'
                        : 'border-neutral-200 bg-neutral-50'
                      }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${motivoNoEntrega.trim() ? 'text-red-700' : 'text-neutral-400'
                        }`}
                    >
                      {updating ? 'Enviando...' : 'Confirmar no entrega'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <View className="mt-6 p-4 rounded-2xl bg-neutral-100 border border-neutral-200">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={20} color="#166534" />
                <Text className="ml-2 text-sm font-semibold text-neutral-700">
                  Entrega finalizada
                </Text>
              </View>
              {delivery?.observaciones ? (
                <Text className="text-sm text-neutral-600 mt-2">{delivery.observaciones}</Text>
              ) : null}
              {delivery?.motivo_no_entrega ? (
                <View className="mt-2 p-3 rounded-xl bg-red-50">
                  <Text className="text-xs font-semibold text-red-700">Motivo de no entrega:</Text>
                  <Text className="text-sm text-red-800 mt-1">{delivery.motivo_no_entrega}</Text>
                </View>
              ) : null}
            </View>
          )}
        </ScrollView>
      )}

      {/* Modals */}
      {entregaId ? (
        <>
          <AddEvidenceModal
            visible={showAddEvidence}
            onClose={() => setShowAddEvidence(false)}
            entregaId={entregaId}
            onEvidenceAdded={handleEvidenceAdded}
          />
          <ReportIncidentModal
            visible={showReportIncident}
            onClose={() => setShowReportIncident(false)}
            entregaId={entregaId}
            onIncidentReported={handleIncidentReported}
          />
        </>
      ) : null}
      <EvidenceGalleryModal
        visible={showEvidenceGallery}
        onClose={() => setShowEvidenceGallery(false)}
        evidencias={evidencias}
      />
      <IncidentListModal
        visible={showIncidentList}
        onClose={() => setShowIncidentList(false)}
        incidencias={incidencias}
      />
    </View>
  )
}
