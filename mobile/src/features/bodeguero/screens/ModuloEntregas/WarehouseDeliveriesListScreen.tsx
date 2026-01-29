import React from 'react'
import { View, Text, Pressable, StyleSheet, RefreshControl, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'

import { Header } from '../../../../components/ui/Header'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { DashboardCard } from '../../../../components/ui/DashboardCard'
import { BRAND_COLORS } from '../../../../shared/types'
import { Delivery, DeliveryService } from '../../../../services/api/DeliveryService'

type StatusFilter = 'todos' | 'pendiente' | 'en_ruta'

const getStatusBadge = (estado: string) => {
    switch (estado) {
        case 'pendiente':
            return { bg: '#FEF3C7', text: '#92400E', label: 'Pendiente', icon: 'time-outline' }
        case 'en_ruta':
            return { bg: '#DBEAFE', text: '#1D4ED8', label: 'En ruta', icon: 'navigate' }
        default:
            return { bg: '#E5E7EB', text: '#4B5563', label: estado, icon: 'help-circle-outline' }
    }
}

export function WarehouseDeliveriesListScreen() {
    const navigation = useNavigation<any>()
    const [deliveries, setDeliveries] = React.useState<Delivery[]>([])
    const [loading, setLoading] = React.useState(false)
    const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('todos')

    const fetchDeliveries = React.useCallback(async () => {
        setLoading(true)
        try {
            // Obtener entregas pendientes y en ruta para verificación de despacho
            const data = await DeliveryService.getDeliveries({})
            // Filtrar solo las que son relevantes para bodega
            const relevant = data.filter(d => d.estado === 'pendiente' || d.estado === 'en_ruta')
            setDeliveries(relevant)
        } finally {
            setLoading(false)
        }
    }, [])

    useFocusEffect(
        React.useCallback(() => {
            fetchDeliveries()
        }, [fetchDeliveries]),
    )

    // KPIs
    const kpis = React.useMemo(() => {
        const pendientes = deliveries.filter(d => d.estado === 'pendiente').length
        const enRuta = deliveries.filter(d => d.estado === 'en_ruta').length
        return { total: deliveries.length, pendientes, enRuta }
    }, [deliveries])

    const filtered = React.useMemo(() => {
        if (statusFilter === 'todos') return deliveries
        return deliveries.filter(d => d.estado === statusFilter)
    }, [deliveries, statusFilter])

    const statusOptions = [
        { id: 'todos', name: 'Todos' },
        { id: 'pendiente', name: 'Pendientes' },
        { id: 'en_ruta', name: 'En ruta' },
    ]

    return (
        <View className="flex-1 bg-neutral-50">
            <Header title="Entregas en Despacho" variant="standard" onBackPress={() => navigation.goBack()} />

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDeliveries} colors={[BRAND_COLORS.red]} />}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* KPIs */}
                <View className="px-4 pt-4">
                    <View className="flex-row justify-between -mx-1.5">
                        <DashboardCard
                            label="Total"
                            value={kpis.total}
                            icon="cube-outline"
                            color={BRAND_COLORS.red}
                            columns={3}
                        />
                        <DashboardCard
                            label="Pendientes"
                            value={kpis.pendientes}
                            icon="time-outline"
                            color="#F59E0B"
                            columns={3}
                        />
                        <DashboardCard
                            label="En Ruta"
                            value={kpis.enRuta}
                            icon="navigate"
                            color="#3B82F6"
                            columns={3}
                        />
                    </View>
                </View>

                {/* Filter */}
                <View className="px-4 py-4">
                    <CategoryFilter
                        categories={statusOptions}
                        selectedId={statusFilter}
                        onSelect={(value) => setStatusFilter(value as StatusFilter)}
                    />
                </View>

                {/* List */}
                <View className="px-4">
                    {filtered.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center border border-neutral-200">
                            <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
                            <Text className="text-neutral-500 mt-2 text-center">
                                No hay entregas pendientes de despacho
                            </Text>
                        </View>
                    ) : (
                        filtered.map((delivery) => {
                            const badge = getStatusBadge(delivery.estado)
                            return (
                                <View
                                    key={delivery.id}
                                    className="bg-white rounded-2xl border border-neutral-200 px-4 py-4 mb-3"
                                    style={styles.card}
                                >
                                    <View style={styles.cardRow}>
                                        <View style={[styles.iconWrap, { backgroundColor: badge.bg }]}>
                                            <Ionicons name={badge.icon as any} size={20} color={badge.text} />
                                        </View>
                                        <View style={styles.cardContent}>
                                            <Text style={styles.title}>Pedido #{delivery.pedido_id.slice(0, 8)}</Text>
                                            <Text style={styles.subtitle}>
                                                Transportista: {delivery.transportista_id?.slice(0, 8) || '---'}
                                            </Text>
                                            {delivery.asignado_en && (
                                                <Text style={styles.date}>
                                                    {new Date(delivery.asignado_en).toLocaleTimeString()}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                                            <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                                        </View>
                                    </View>
                                </View>
                            )
                        })
                    )}
                </View>
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
    date: {
        fontSize: 11,
        color: '#9CA3AF',
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
