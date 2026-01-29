import React from 'react'
import { View, Text, Pressable, StyleSheet, RefreshControl, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'

import { Header } from '../../../../components/ui/Header'
import { ClientHeaderMenu } from '../../../../components/ui/ClientHeaderMenu'
import { BRAND_COLORS } from '../../../../shared/types'
import { Delivery, DeliveryService } from '../../../../services/api/DeliveryService'


const getStatusBadge = (estado: string) => {
    switch (estado) {
        case 'pendiente':
            return { bg: '#E5E7EB', text: '#4B5563', label: 'Pendiente', icon: 'time-outline' }
        case 'en_ruta':
            return { bg: '#DBEAFE', text: '#1D4ED8', label: 'En camino', icon: 'navigate' }
        case 'entregado_completo':
            return { bg: '#DCFCE7', text: '#166534', label: 'Entregado', icon: 'checkmark-circle' }
        case 'entregado_parcial':
            return { bg: '#FEF3C7', text: '#92400E', label: 'Parcial', icon: 'checkmark' }
        case 'no_entregado':
            return { bg: '#FEE2E2', text: '#991B1B', label: 'No entregado', icon: 'close-circle' }
        case 'cancelado':
            return { bg: '#FEE2E2', text: '#991B1B', label: 'Cancelado', icon: 'ban' }
        default:
            return { bg: '#E5E7EB', text: '#4B5563', label: estado, icon: 'help-circle-outline' }
    }
}

export function ClientDeliveryHistoryScreen() {
    const navigation = useNavigation<any>()
    const [deliveries, setDeliveries] = React.useState<Delivery[]>([])
    const [loading, setLoading] = React.useState(false)

    const fetchDeliveries = React.useCallback(async () => {
        setLoading(true)
        try {
            // En un escenario real, el backend filtraría por cliente_id del token
            // Por ahora obtenemos todas las entregas y el backend debería filtrar
            const data = await DeliveryService.getDeliveries({})
            setDeliveries(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useFocusEffect(
        React.useCallback(() => {
            fetchDeliveries()
        }, [fetchDeliveries]),
    )

    // Group by status
    const activeDeliveries = deliveries.filter(d =>
        d.estado === 'pendiente' || d.estado === 'en_ruta'
    )
    const completedDeliveries = deliveries.filter(d =>
        d.estado === 'entregado_completo' || d.estado === 'entregado_parcial' ||
        d.estado === 'no_entregado' || d.estado === 'cancelado'
    )

    const renderDeliveryCard = (delivery: Delivery, showDate: boolean = false) => {
        const badge = getStatusBadge(delivery.estado)
        return (
            <Pressable
                key={delivery.id}
                onPress={() => navigation.navigate('ClienteSeguimientoEntrega', { pedidoId: delivery.pedido_id })}
                className="bg-white rounded-2xl border border-neutral-200 px-4 py-4 mb-3"
                style={styles.card}
            >
                <View style={styles.cardRow}>
                    <View style={[styles.iconWrap, { backgroundColor: badge.bg }]}>
                        <Ionicons name={badge.icon as any} size={20} color={badge.text} />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.title}>Pedido #{delivery.pedido_id.slice(0, 8)}</Text>
                        {showDate && delivery.asignado_en && (
                            <Text style={styles.subtitle}>
                                {new Date(delivery.asignado_en).toLocaleDateString()}
                            </Text>
                        )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                </View>

                {/* Progress indicator for active deliveries */}
                {(delivery.estado === 'pendiente' || delivery.estado === 'en_ruta') && (
                    <View className="mt-3 pt-3 border-t border-neutral-100">
                        <View className="flex-row items-center">
                            <View className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        backgroundColor: delivery.estado === 'en_ruta' ? '#3B82F6' : '#9CA3AF',
                                        width: delivery.estado === 'en_ruta' ? '66%' : '33%'
                                    }}
                                />
                            </View>
                            <Text className="ml-3 text-xs font-medium text-neutral-500">
                                {delivery.estado === 'en_ruta' ? 'En camino' : 'Preparando'}
                            </Text>
                        </View>
                    </View>
                )}
            </Pressable>
        )
    }

    return (
        <View className="flex-1 bg-neutral-50">
            <Header title="Mis Entregas" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<ClientHeaderMenu />} />

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDeliveries} colors={[BRAND_COLORS.red]} />}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            >
                {deliveries.length === 0 && !loading ? (
                    <View className="bg-white rounded-2xl p-8 items-center border border-neutral-200">
                        <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
                        <Text className="text-neutral-500 mt-2 text-center">
                            No tienes entregas registradas
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Active Deliveries */}
                        {activeDeliveries.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-lg font-bold text-neutral-800 mb-3 px-1">Entregas Activas</Text>
                                {activeDeliveries.map(d => renderDeliveryCard(d))}
                            </View>
                        )}

                        {/* Completed Deliveries */}
                        {completedDeliveries.length > 0 && (
                            <View>
                                <Text className="text-lg font-bold text-neutral-800 mb-3 px-1">Historial</Text>
                                {completedDeliveries.map(d => renderDeliveryCard(d, true))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
        marginRight: 10,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    statusBadge: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
})
