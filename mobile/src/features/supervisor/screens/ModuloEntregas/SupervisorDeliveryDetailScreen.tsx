import React from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { MiniMapPreview } from '../../../../components/ui/MiniMapPreview'

import { Header } from '../../../../components/ui/Header'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { TextField } from '../../../../components/ui/TextField'
import { EvidenceGalleryModal } from '../../../../components/delivery/EvidenceGalleryModal'
import { IncidentListModal } from '../../../../components/delivery/IncidentListModal'
import { FeedbackModal } from '../../../../components/ui/FeedbackModal'
import { BRAND_COLORS } from '../../../../shared/types'
import { DeliveryDetail, DeliveryService } from '../../../../services/api/DeliveryService'
import { OrderService } from '../../../../services/api/OrderService'
import { UserClientService } from '../../../../services/api/UserClientService'
import { UserService } from '../../../../services/api/UserService'
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

export function SupervisorDeliveryDetailScreen() {
    const navigation = useNavigation<any>()
    const route = useRoute<any>()
    const entregaId = route.params?.entregaId as string | undefined

    const [loading, setLoading] = React.useState(false)
    const [delivery, setDelivery] = React.useState<DeliveryDetail | null>(null)
    const [clientPoint, setClientPoint] = React.useState<{ latitude: number; longitude: number } | null>(null)
    const [clientName, setClientName] = React.useState<string | null>(null)
    const [clientAddress, setClientAddress] = React.useState<string | null>(null)
    const [orderNumber, setOrderNumber] = React.useState<string | null>(null)
    const [driverName, setDriverName] = React.useState<string | null>(null)
    const [updating, setUpdating] = React.useState(false)
    const [motivoCancelacion, setMotivoCancelacion] = React.useState('')

    // Modal states
    const [showEvidenceGallery, setShowEvidenceGallery] = React.useState(false)
    const [showIncidentList, setShowIncidentList] = React.useState(false)
    const [showCancelModal, setShowCancelModal] = React.useState(false)

    const loadDelivery = React.useCallback(async () => {
        if (!entregaId) return
        setLoading(true)
        try {
            const data = await DeliveryService.getDeliveryDetail(entregaId)
            setDelivery(data)
            if (data?.transportista_id) {
                const driver = await UserService.getUserDetail(data.transportista_id)
                setDriverName(driver?.name || data.transportista_id.slice(0, 8))
            }
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

    const handleCancel = async () => {
        if (!entregaId || !motivoCancelacion.trim()) return
        setUpdating(true)
        try {
            const updated = await DeliveryService.cancelDelivery(entregaId, motivoCancelacion.trim())
            if (!updated) {
                showGlobalToast('No se pudo cancelar la entrega', 'error')
                return
            }
            setDelivery((prev) => (prev ? { ...prev, ...updated } : null))
            setShowCancelModal(false)
            setMotivoCancelacion('')
            showGlobalToast('Entrega cancelada', 'success')
        } finally {
            setUpdating(false)
        }
    }

    const estado = delivery?.estado || 'pendiente'
    const statusBadge = getStatusBadge(estado)
    const evidencias = delivery?.evidencias || []
    const incidencias = delivery?.incidencias || []
    const canCancel = estado === 'pendiente' || estado === 'en_ruta'
    return (
        <View className="flex-1 bg-neutral-50">
            <Header title="Detalle Entrega" variant="standard" onBackPress={() => navigation.goBack()} />

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
                            <View className="mt-4 flex-row">
                                <View className="flex-1">
                                    <Text className="text-xs text-slate-100">Pedido</Text>
                                    <Text className="text-sm font-semibold text-white">
                                        {orderNumber || delivery?.pedido_id?.slice(0, 8) || '---'}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs text-slate-100">Transportista</Text>
                                    <Text className="text-sm font-semibold text-white">
                                        {driverName || delivery?.transportista_id?.slice(0, 8) || '---'}
                                    </Text>
                                </View>
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

                    {/* Timestamps */}
                    <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
                        <Text className="text-sm font-semibold text-neutral-800 mb-3">Historial de tiempos</Text>
                        <View className="space-y-2">
                            {delivery?.asignado_en && (
                                <View className="flex-row items-center">
                                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                                    <Text className="ml-2 text-xs text-neutral-600">
                                        Asignado: {new Date(delivery.asignado_en).toLocaleString()}
                                    </Text>
                                </View>
                            )}
                            {delivery?.salida_ruta_en && (
                                <View className="flex-row items-center mt-1">
                                    <Ionicons name="navigate-outline" size={16} color="#F59E0B" />
                                    <Text className="ml-2 text-xs text-neutral-600">
                                        En ruta: {new Date(delivery.salida_ruta_en).toLocaleString()}
                                    </Text>
                                </View>
                            )}
                            {delivery?.entregado_en && (
                                <View className="flex-row items-center mt-1">
                                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                    <Text className="ml-2 text-xs text-neutral-600">
                                        Entregado: {new Date(delivery.entregado_en).toLocaleString()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Notes */}
                    {delivery?.observaciones || delivery?.motivo_no_entrega ? (
                        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
                            {delivery.observaciones && (
                                <View className="mb-2">
                                    <Text className="text-xs font-semibold text-neutral-500">Observaciones</Text>
                                    <Text className="text-sm text-neutral-700 mt-1">{delivery.observaciones}</Text>
                                </View>
                            )}
                            {delivery.motivo_no_entrega && (
                                <View className="p-3 rounded-xl bg-red-50 mt-2">
                                    <Text className="text-xs font-semibold text-red-700">Motivo de no entrega:</Text>
                                    <Text className="text-sm text-red-800 mt-1">{delivery.motivo_no_entrega}</Text>
                                </View>
                            )}
                        </View>
                    ) : null}

                    {/* Cancel Action */}
                    {canCancel && (
                        <View className="mt-6">
                            <Pressable
                                onPress={() => setShowCancelModal(true)}
                                className="rounded-2xl py-4 items-center flex-row justify-center border border-red-300 bg-red-50"
                            >
                                <Ionicons name="close-circle-outline" size={20} color="#991B1B" />
                                <Text className="ml-2 text-base font-semibold text-red-700">Cancelar Entrega</Text>
                            </Pressable>
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Modals */}
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
            <FeedbackModal
                visible={showCancelModal}
                type="warning"
                title="Cancelar Entrega"
                message="¿Estás seguro que deseas cancelar esta entrega? Esta acción no se puede deshacer."
                onClose={() => setShowCancelModal(false)}
                showCancel
                cancelText="Volver"
                confirmText={updating ? 'Cancelando...' : 'Cancelar Entrega'}
                onConfirm={handleCancel}
            >
                <View className="w-full mb-4">
                    <TextField
                        label="Motivo de cancelación"
                        value={motivoCancelacion}
                        onChangeText={setMotivoCancelacion}
                        placeholder="Ingresa el motivo..."
                    />
                </View>
            </FeedbackModal>
        </View>
    )
}
