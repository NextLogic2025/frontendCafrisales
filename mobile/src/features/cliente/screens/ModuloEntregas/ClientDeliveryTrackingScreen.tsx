import React from 'react'
import { View, Text, Pressable, StyleSheet, RefreshControl, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'

import { Header } from '../../../../components/ui/Header'
import { ClientHeaderMenu } from '../../../../components/ui/ClientHeaderMenu'
import { MiniMapPreview } from '../../../../components/ui/MiniMapPreview'
import { BRAND_COLORS } from '../../../../shared/types'
import { DeliveryDetail, DeliveryService } from '../../../../services/api/DeliveryService'
import { showGlobalToast } from '../../../../utils/toastService'

const getStatusInfo = (estado: string) => {
    switch (estado) {
        case 'pendiente':
            return {
                bg: '#E5E7EB', text: '#4B5563', label: 'Pendiente',
                icon: 'time-outline',
                message: 'Tu pedido está siendo preparado'
            }
        case 'en_ruta':
            return {
                bg: '#DBEAFE', text: '#1D4ED8', label: 'En camino',
                icon: 'navigate',
                message: '¡Tu pedido está en camino!'
            }
        case 'entregado_completo':
            return {
                bg: '#DCFCE7', text: '#166534', label: 'Entregado',
                icon: 'checkmark-circle',
                message: 'Pedido entregado exitosamente'
            }
        case 'entregado_parcial':
            return {
                bg: '#FEF3C7', text: '#92400E', label: 'Entrega parcial',
                icon: 'checkmark',
                message: 'Se realizó una entrega parcial'
            }
        case 'no_entregado':
            return {
                bg: '#FEE2E2', text: '#991B1B', label: 'No entregado',
                icon: 'close-circle',
                message: 'No se pudo realizar la entrega'
            }
        case 'cancelado':
            return {
                bg: '#FEE2E2', text: '#991B1B', label: 'Cancelado',
                icon: 'ban',
                message: 'Entrega cancelada'
            }
        default:
            return {
                bg: '#E5E7EB', text: '#4B5563', label: estado,
                icon: 'help-circle-outline',
                message: ''
            }
    }
}

export function ClientDeliveryTrackingScreen() {
    const navigation = useNavigation<any>()
    const route = useRoute<any>()
    const pedidoId = route.params?.pedidoId as string | undefined

    const [loading, setLoading] = React.useState(false)
    const [delivery, setDelivery] = React.useState<DeliveryDetail | null>(null)

    const loadDelivery = React.useCallback(async () => {
        if (!pedidoId) return
        setLoading(true)
        try {
            // Buscar entregas por pedido_id
            const deliveries = await DeliveryService.getDeliveries({ pedido_id: pedidoId })
            if (deliveries.length > 0) {
                // Obtener detalle de la primera entrega
                const detail = await DeliveryService.getDeliveryDetail(deliveries[0].id)
                setDelivery(detail)
            }
        } catch (error) {
            showGlobalToast('Error al cargar seguimiento', 'error')
        } finally {
            setLoading(false)
        }
    }, [pedidoId])

    useFocusEffect(
        React.useCallback(() => {
            loadDelivery()
        }, [loadDelivery]),
    )

    const statusInfo = getStatusInfo(delivery?.estado || 'pendiente')
    const hasLocation = delivery?.latitud && delivery?.longitud

    return (
        <View className="flex-1 bg-neutral-50">
            <Header title="Seguimiento de Entrega" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<ClientHeaderMenu />} />

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDelivery} colors={[BRAND_COLORS.red]} />}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            >
                {!delivery && !loading ? (
                    <View className="bg-white rounded-2xl p-8 items-center border border-neutral-200">
                        <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
                        <Text className="text-neutral-500 mt-2 text-center">
                            No hay información de entrega para este pedido
                        </Text>
                    </View>
                ) : delivery ? (
                    <>
                        {/* Status Hero Card */}
                        <View
                            className="rounded-3xl p-6 mb-5 items-center"
                            style={{ backgroundColor: statusInfo.bg }}
                        >
                            <View
                                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                                style={{ backgroundColor: `${statusInfo.text}20` }}
                            >
                                <Ionicons name={statusInfo.icon as any} size={40} color={statusInfo.text} />
                            </View>
                            <Text className="text-xl font-bold mb-2" style={{ color: statusInfo.text }}>
                                {statusInfo.label}
                            </Text>
                            <Text className="text-sm text-center" style={{ color: statusInfo.text }}>
                                {statusInfo.message}
                            </Text>
                        </View>

                        {/* Order Info */}
                        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mb-4">
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="receipt-outline" size={20} color={BRAND_COLORS.red} />
                                <Text className="ml-2 text-sm font-semibold text-neutral-900">Pedido #{pedidoId?.slice(0, 8)}</Text>
                            </View>

                            {/* Timeline */}
                            <View className="mt-2">
                                {delivery.asignado_en && (
                                    <View className="flex-row items-center mb-2">
                                        <View className="w-3 h-3 rounded-full bg-green-500 mr-3" />
                                        <View className="flex-1">
                                            <Text className="text-xs text-neutral-500">Asignado</Text>
                                            <Text className="text-sm text-neutral-700">
                                                {new Date(delivery.asignado_en).toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {delivery.salida_ruta_en && (
                                    <View className="flex-row items-center mb-2">
                                        <View className="w-3 h-3 rounded-full bg-blue-500 mr-3" />
                                        <View className="flex-1">
                                            <Text className="text-xs text-neutral-500">En camino</Text>
                                            <Text className="text-sm text-neutral-700">
                                                {new Date(delivery.salida_ruta_en).toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {delivery.entregado_en && (
                                    <View className="flex-row items-center">
                                        <View className="w-3 h-3 rounded-full bg-emerald-500 mr-3" />
                                        <View className="flex-1">
                                            <Text className="text-xs text-neutral-500">Entregado</Text>
                                            <Text className="text-sm text-neutral-700">
                                                {new Date(delivery.entregado_en).toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Location Map */}
                        {hasLocation && (
                            <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mb-4">
                                <View className="flex-row items-center mb-3">
                                    <Ionicons name="location-outline" size={20} color={BRAND_COLORS.red} />
                                    <Text className="ml-2 text-sm font-semibold text-neutral-900">Ubicación de entrega</Text>
                                </View>
                                <MiniMapPreview
                                    center={{ latitude: Number(delivery.latitud), longitude: Number(delivery.longitud) }}
                                    marker={{ latitude: Number(delivery.latitud), longitude: Number(delivery.longitud) }}
                                    height={180}
                                />
                            </View>
                        )}

                        {/* Notes */}
                        {(delivery.observaciones || delivery.motivo_no_entrega) && (
                            <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
                                {delivery.observaciones && (
                                    <View className="mb-2">
                                        <Text className="text-xs font-semibold text-neutral-500">Observaciones</Text>
                                        <Text className="text-sm text-neutral-700 mt-1">{delivery.observaciones}</Text>
                                    </View>
                                )}
                                {delivery.motivo_no_entrega && (
                                    <View className="p-3 rounded-xl bg-red-50 mt-2">
                                        <Text className="text-xs font-semibold text-red-700">Motivo:</Text>
                                        <Text className="text-sm text-red-800 mt-1">{delivery.motivo_no_entrega}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </>
                ) : null}
            </ScrollView>
        </View>
    )
}
