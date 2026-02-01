import React, { useState } from 'react'
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Order, OrderStatus, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../../services/api/OrderService'
import { BRAND_COLORS } from '../../shared/types'

interface OrderStatusModalProps {
    visible: boolean
    order: Order | null
    allowedStatuses: OrderStatus[]
    onStatusChange: (status: OrderStatus) => Promise<void>
    onClose: () => void
    isProcessing?: boolean
}

export function OrderStatusModal({
    visible,
    order,
    allowedStatuses,
    onStatusChange,
    onClose,
    isProcessing = false
}: OrderStatusModalProps) {
    const [changing, setChanging] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
    const currentStatus = (order?.estado as OrderStatus) || order?.estado_actual || 'pendiente_validacion'

    const handleStatusChange = async (status: OrderStatus) => {
        setSelectedStatus(status)
        setChanging(true)
        try {
            await onStatusChange(status)
        } finally {
            setChanging(false)
            setSelectedStatus(null)
        }
    }

    const getStatusIcon = (status: OrderStatus): keyof typeof Ionicons.glyphMap => {
        switch (status) {
            case 'pendiente_validacion':
                return 'time'
            case 'validado':
                return 'checkmark-circle'
            case 'rechazado_cliente':
                return 'close-circle'
            case 'ajustado_bodega':
                return 'alert-circle'
            case 'aceptado_cliente':
                return 'checkmark-done-circle'
            case 'asignado_ruta':
                return 'map'
            case 'en_ruta':
                return 'car'
            case 'entregado':
                return 'checkmark-done-circle'
            case 'cancelado':
                return 'ban'
            default:
                return 'time'
        }
    }

    const getStatusDescription(status: OrderStatus): string => {
        switch (status) {
            case 'pendiente_validacion':
                return 'Pedido pendiente de validacion por bodega'
            case 'validado':
                return 'Pedido validado por bodega'
            case 'ajustado_bodega':
                return 'Pedido ajustado por bodega, requiere respuesta del cliente'
            case 'aceptado_cliente':
                return 'Cliente acepto los ajustes de bodega'
            case 'rechazado_cliente':
                return 'Cliente rechazo los ajustes'
            case 'asignado_ruta':
                return 'Pedido asignado a un rutero logistico'
            case 'en_ruta':
                return 'Transportista en ruta'
            case 'entregado':
                return 'Pedido entregado'
            case 'cancelado':
                return 'Pedido cancelado'
            default:
                return 'Cambiar a este estado'
        }
    }

    if (!order) return null

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl pb-8">
                    <View className="flex-row justify-between items-center p-5 border-b border-neutral-100">
                        <View>
                            <Text className="text-neutral-900 font-bold text-lg">Cambiar Estado</Text>
                            <Text className="text-neutral-500 text-sm mt-1">
                                Pedido #{order.codigo_visual}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} disabled={changing}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="max-h-96">
                        <View className="p-5">
                            <View className="mb-4 p-3 bg-neutral-50 rounded-xl">
                                <Text className="text-neutral-600 text-sm mb-1">Estado actual:</Text>
                                <View
                                    className="self-start px-3 py-1.5 rounded-full"
                                    style={{ backgroundColor: `${ORDER_STATUS_COLORS[currentStatus]}20` }}
                                >
                                    <Text
                                        className="text-sm font-bold uppercase"
                                        style={{ color: ORDER_STATUS_COLORS[currentStatus] }}
                                    >
                                        {ORDER_STATUS_LABELS[currentStatus]}
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-neutral-900 font-bold mb-3">Selecciona nuevo estado:</Text>

                            {allowedStatuses.map((status) => {
                                const isCurrentStatus = currentStatus === status
                                const isProcessingThis = (changing || isProcessing) && selectedStatus === status
                                const allDisabled = changing || isProcessing

                                return (
                                    <TouchableOpacity
                                        key={status}
                                        onPress={() => handleStatusChange(status)}
                                        className="flex-row items-center justify-between p-4 mb-2 bg-neutral-50 rounded-xl border border-neutral-100 active:bg-neutral-100"
                                        disabled={isCurrentStatus || allDisabled}
                                    >
                                        <View className="flex-row items-center gap-3">
                                            <View
                                                className="w-10 h-10 rounded-full items-center justify-center"
                                                style={{ backgroundColor: `${ORDER_STATUS_COLORS[status]}20` }}
                                            >
                                                {isProcessingThis ? (
                                                    <ActivityIndicator size="small" color={ORDER_STATUS_COLORS[status]} />
                                                ) : (
                                                    <Ionicons
                                                        name={getStatusIcon(status)}
                                                        size={24}
                                                        color={ORDER_STATUS_COLORS[status]}
                                                    />
                                                )}
                                            </View>
                                            <View>
                                                <Text className={`font-medium ${isCurrentStatus ? 'text-neutral-400' : 'text-neutral-900'}`}>
                                                    {ORDER_STATUS_LABELS[status]}
                                                </Text>
                                                <Text className="text-neutral-500 text-xs">
                                                    {getStatusDescription(status)}
                                                </Text>
                                            </View>
                                        </View>
                                        {isCurrentStatus && (
                                            <Ionicons name="checkmark-circle" size={24} color={ORDER_STATUS_COLORS[status]} />
                                        )}
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    )
}
