import React from 'react'
import { View, Text, Pressable, StyleSheet, RefreshControl, FlatList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'

import { Header } from '../../../../components/ui/Header'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { DashboardCard } from '../../../../components/ui/DashboardCard'
import { BRAND_COLORS } from '../../../../shared/types'
import { Delivery, DeliveryService } from '../../../../services/api/DeliveryService'
import { OrderService } from '../../../../services/api/OrderService'
import { UserService } from '../../../../services/api/UserService'
import { UserClientService } from '../../../../services/api/UserClientService'
import { formatNameOrId, formatOrderLabel } from '../../../../utils/formatters'
import { lookupCache } from '../../../../utils/lookupCache'

type StatusFilter = 'todos' | 'pendiente' | 'en_ruta' | 'entregado_completo' | 'no_entregado' | 'cancelado'

const statusBadge = (estado: string) => {
    switch (estado) {
        case 'pendiente':
            return { bg: '#E5E7EB', text: '#4B5563', label: 'Pendiente', icon: 'time-outline' }
        case 'en_ruta':
            return { bg: '#FEF3C7', text: '#92400E', label: 'En ruta', icon: 'navigate-outline' }
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

export function SupervisorDeliveriesListScreen() {
    const navigation = useNavigation<any>()
    const [deliveries, setDeliveries] = React.useState<Delivery[]>([])
    const [loading, setLoading] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('todos')
    const [orderLabels, setOrderLabels] = React.useState<Record<string, string>>({})
    const [driverNames, setDriverNames] = React.useState<Record<string, string>>({})
    const [clientNames, setClientNames] = React.useState<Record<string, string>>({})

    React.useEffect(() => {
        lookupCache.preload()
    }, [])

    const hydrateLookupData = React.useCallback(async (items: Delivery[]) => {
        const uniqueOrderIds = Array.from(new Set(items.map((item) => item.pedido_id).filter(Boolean)))
        const uniqueDriverIds = Array.from(new Set(items.map((item) => item.transportista_id).filter(Boolean)))

        const missingOrders = uniqueOrderIds.filter((id) => !orderLabels[id] && !lookupCache.getOrderLabel(id))
        const missingDrivers = uniqueDriverIds.filter((id) => id && !driverNames[id] && !lookupCache.getDriverName(id))
        const missingClients = uniqueOrderIds.filter((id) => !clientNames[id] && !lookupCache.getClientName(id))

        if (missingOrders.length > 0) {
            const orderResults = await Promise.all(
                missingOrders.map(async (orderId) => {
                    const order = await OrderService.getOrderById(orderId)
                    return {
                        id: orderId,
                        label: formatOrderLabel(order?.numero_pedido, orderId),
                        clientId: order?.cliente_id || null,
                    }
                }),
            )
            setOrderLabels((prev) => {
                const next = { ...prev }
                orderResults.forEach((entry) => {
                    next[entry.id] = entry.label
                    lookupCache.setOrderLabel(entry.id, entry.label)
                })
                return next
            })
        }

        if (missingDrivers.length > 0) {
            const driverResults = await Promise.all(
                missingDrivers.map(async (driverId) => {
                    const driver = await UserService.getUserDetail(driverId)
                    return {
                        id: driverId,
                        name: formatNameOrId(driver?.name, driverId),
                    }
                }),
            )
            setDriverNames((prev) => {
                const next = { ...prev }
                driverResults.forEach((entry) => {
                    next[entry.id] = entry.name
                    lookupCache.setDriverName(entry.id, entry.name)
                })
                return next
            })
        }

        if (missingClients.length > 0) {
            const clientMap: Record<string, string> = {}
            const clientOrders = await Promise.all(
                missingClients.map(async (orderId) => {
                    const order = await OrderService.getOrderById(orderId)
                    return { orderId, clientId: order?.cliente_id || null }
                }),
            )
            await Promise.all(
                clientOrders.map(async (entry) => {
                    if (!entry.clientId) return
                    const client = await UserClientService.getClient(entry.clientId)
                    clientMap[entry.orderId] = formatNameOrId(client?.nombre_comercial || client?.ruc, entry.clientId)
                }),
            )
            if (Object.keys(clientMap).length > 0) {
                setClientNames((prev) => ({ ...prev, ...clientMap }))
                Object.entries(clientMap).forEach(([orderId, name]) => lookupCache.setClientName(orderId, name))
            }
        }
    }, [driverNames, orderLabels, clientNames])

    const fetchDeliveries = React.useCallback(async () => {
        setLoading(true)
        try {
            const data = await DeliveryService.getDeliveries({})
            setDeliveries(data)
            if (data.length > 0) {
                hydrateLookupData(data)
            }
        } finally {
            setLoading(false)
        }
    }, [hydrateLookupData])

    useFocusEffect(
        React.useCallback(() => {
            fetchDeliveries()
        }, [fetchDeliveries]),
    )

    // Calculate KPIs
    const kpis = React.useMemo(() => {
        const total = deliveries.length
        const pendientes = deliveries.filter(d => d.estado === 'pendiente').length
        const enRuta = deliveries.filter(d => d.estado === 'en_ruta').length
        const entregados = deliveries.filter(d => d.estado === 'entregado_completo' || d.estado === 'entregado_parcial').length
        const fallidas = deliveries.filter(d => d.estado === 'no_entregado' || d.estado === 'cancelado').length
        return { total, pendientes, enRuta, entregados, fallidas }
    }, [deliveries])

    const filtered = React.useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        return deliveries.filter((delivery) => {
            if (statusFilter !== 'todos' && delivery.estado !== statusFilter) return false
            if (!q) return true
            const orderLabel = orderLabels[delivery.pedido_id] || lookupCache.getOrderLabel(delivery.pedido_id) || ''
            const driverName = delivery.transportista_id
                ? (driverNames[delivery.transportista_id] || lookupCache.getDriverName(delivery.transportista_id) || '')
                : ''
            const clientName = clientNames[delivery.pedido_id] || lookupCache.getClientName(delivery.pedido_id) || ''
            return delivery.pedido_id.toLowerCase().includes(q) ||
                orderLabel.toLowerCase().includes(q) ||
                delivery.transportista_id?.toLowerCase().includes(q) ||
                driverName.toLowerCase().includes(q) ||
                clientName.toLowerCase().includes(q) ||
                delivery.id.toLowerCase().includes(q)
        })
    }, [deliveries, searchQuery, statusFilter, orderLabels, driverNames, clientNames])

    const statusOptions = [
        { id: 'todos', name: 'Todos' },
        { id: 'pendiente', name: 'Pendientes' },
        { id: 'en_ruta', name: 'En ruta' },
        { id: 'entregado_completo', name: 'Entregados' },
        { id: 'no_entregado', name: 'Fallidas' },
    ]

    return (
        <View className="flex-1 bg-neutral-50">
            <Header title="Gestión de Entregas" variant="standard" onBackPress={() => navigation.goBack()} />

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDeliveries} colors={[BRAND_COLORS.red]} />}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListHeaderComponent={
                    <>
                        {/* KPIs */}
                        <View className="px-4 pt-4">
                            <View className="flex-row justify-between -mx-1.5">
                                <DashboardCard label="Pendientes" value={kpis.pendientes} icon="time-outline" color="#6B7280" columns={3} />
                                <DashboardCard label="En Ruta" value={kpis.enRuta} icon="navigate-outline" color="#F59E0B" columns={3} />
                                <DashboardCard label="Entregados" value={kpis.entregados} icon="checkmark-circle" color="#10B981" columns={3} />
                            </View>
                        </View>

                        {/* Search and Filter */}
                        <View className="px-4 py-4 bg-white mt-4 shadow-sm">
                            <View className="flex-row items-center">
                                <View className="flex-1 mr-3">
                                    <SearchBar
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        placeholder="Buscar por pedido o transportista..."
                                        onClear={() => setSearchQuery('')}
                                    />
                                </View>
                                <Pressable
                                    className="w-12 h-12 rounded-2xl items-center justify-center"
                                    style={{ backgroundColor: BRAND_COLORS.red }}
                                    onPress={fetchDeliveries}
                                >
                                    <Ionicons name="refresh" size={22} color="white" />
                                </Pressable>
                            </View>

                            <View className="mt-3">
                                <CategoryFilter
                                    categories={statusOptions}
                                    selectedId={statusFilter}
                                    onSelect={(value) => setStatusFilter(value as StatusFilter)}
                                />
                            </View>
                        </View>
                    </>
                }
                ListEmptyComponent={
                    <View className="px-4 pt-4">
                        <View className="bg-white rounded-2xl p-8 items-center border border-neutral-200">
                            <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
                            <Text className="text-neutral-500 mt-2">No hay entregas</Text>
                        </View>
                    </View>
                }
                renderItem={({ item: delivery }) => {
                    const badge = statusBadge(delivery.estado)
                    const orderLabel =
                        orderLabels[delivery.pedido_id] ||
                        lookupCache.getOrderLabel(delivery.pedido_id) ||
                        formatOrderLabel(undefined, delivery.pedido_id)
                    const driverLabel = delivery.transportista_id
                        ? (driverNames[delivery.transportista_id] ||
                            lookupCache.getDriverName(delivery.transportista_id) ||
                            formatNameOrId(undefined, delivery.transportista_id))
                        : '---'
                    const clientLabel =
                        clientNames[delivery.pedido_id] || lookupCache.getClientName(delivery.pedido_id)
                    return (
                        <Pressable
                            onPress={() => navigation.navigate('SupervisorEntregaDetalle', { entregaId: delivery.id })}
                            className="bg-white rounded-2xl border border-neutral-200 px-4 py-4 mb-3 mx-4"
                            style={styles.card}
                        >
                            <View style={styles.cardRow}>
                                <View style={styles.iconWrap}>
                                    <Ionicons name={badge.icon as any} size={20} color={badge.text} />
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={styles.title}>Pedido {orderLabel}</Text>
                                    <Text style={styles.subtitle}>
                                        Transportista: {driverLabel}
                                    </Text>
                                    {clientLabel ? (
                                        <Text style={styles.subtitle}>Cliente: {clientLabel}</Text>
                                    ) : null}
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                                    <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                                </View>
                            </View>
                        </Pressable>
                    )
                }}
            />
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
        width: 46,
        height: 46,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
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
        marginTop: 4,
    },
    statusBadge: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
})
