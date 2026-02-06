import React from 'react'
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { BRAND_COLORS } from '../../../../shared/types'

import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { getUserName } from '../../../../storage/authStorage'
import { UserService } from '../../../../services/api/UserService'
import { DashboardCard } from '../../../../components/ui/DashboardCard'
import { QuickActionsGrid } from '../../../../components/ui/QuickActionsGrid'
import { UserClientService } from '../../../../services/api/UserClientService'
import { OrderService, OrderListItem } from '../../../../services/api/OrderService'
import { DeliveryService } from '../../../../services/api/DeliveryService'

type KPI = {
    label: string
    value: string | number
    icon: string
    color: string
}

type AlertItem = {
    id: string
    message: string
    type: 'critical' | 'warning'
    timestamp: string
}

const DEFAULT_KPIS: KPI[] = [
    { label: 'Clientes', value: '-', icon: 'people-outline', color: BRAND_COLORS.red },
    { label: 'Pedidos Activos', value: '-', icon: 'cart-outline', color: '#10B981' },
    { label: 'Incidencias', value: '-', icon: 'alert-circle-outline', color: '#F59E0B' }
]

export function SupervisorDashboardScreen() {
    const navigation = useNavigation<any>()
    const [kpis, setKpis] = React.useState<KPI[]>(DEFAULT_KPIS)
    const [alerts, setAlerts] = React.useState<AlertItem[]>([])
    const [recentOrders, setRecentOrders] = React.useState<OrderListItem[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [userName, setUserName] = React.useState('Supervisor')

    const loadData = React.useCallback(async () => {
        setIsLoading(true)
        try {
            // 1. Profile Name
            const profile = await UserService.getProfile()
            if (profile?.name) setUserName(profile.name)
            else {
                const storedName = await getUserName()
                if (storedName) setUserName(storedName)
            }

            // 2. Fetch Data in Parallel
            const [clients, orders, deliveriesForScan] = await Promise.all([
                UserClientService.getClients('activo'),
                OrderService.getOrders(),
                DeliveryService.getDeliveries({ page: 1, limit: 100 })
            ])

            setRecentOrders(orders.slice(0, 3))

            const incidentsByDelivery = await Promise.all(
                deliveriesForScan.map(async (delivery) => {
                    const incidents = await DeliveryService.getIncidents({ deliveryId: delivery.id })
                    return incidents ?? []
                }),
            )

            const incidentsSafe = incidentsByDelivery.flat()

            // 3. Process KPIs
            const activeOrders = orders.filter(o =>
                o.estado !== 'entregado' &&
                o.estado !== 'cancelado' &&
                o.estado !== 'rechazado'
            ).length

            setKpis([
                { label: 'Clientes', value: clients.length, icon: 'people-outline', color: BRAND_COLORS.red },
                { label: 'Pedidos Activos', value: activeOrders, icon: 'cart-outline', color: '#10B981' },
                { label: 'Incidencias', value: incidentsSafe.length, icon: 'alert-circle-outline', color: '#F59E0B' }
            ])

            // 4. Process Alerts (from Incidents)
            const mappedAlerts: AlertItem[] = incidentsSafe.slice(0, 5).map(inc => ({
                id: inc.id,
                message: inc.descripcion,
                type: inc.severidad === 'critica' || inc.severidad === 'alta' ? 'critical' : 'warning',
                timestamp: inc.reportado_en ? new Date(inc.reportado_en).toLocaleDateString() : 'Hoy'
            }))

            setAlerts(mappedAlerts)

        } catch (error) {
            console.error('Error loading dashboard data', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const getOrderStatusStyle = (estado?: string) => {
        switch (estado) {
            case 'pendiente_validacion':
                return { bg: '#FEF3C7', color: '#92400E', label: 'Pendiente validacion' }
            case 'validado':
                return { bg: '#DCFCE7', color: '#166534', label: 'Validado' }
            case 'ajustado_bodega':
                return { bg: '#FFEDD5', color: '#9A3412', label: 'Ajustado bodega' }
            case 'aceptado_cliente':
                return { bg: '#DCFCE7', color: '#166534', label: 'Aceptado' }
            case 'rechazado_cliente':
                return { bg: '#FEE2E2', color: '#991B1B', label: 'Rechazado' }
            case 'asignado_ruta':
                return { bg: '#E0F2FE', color: '#0369A1', label: 'Asignado ruta' }
            case 'en_ruta':
                return { bg: '#DBEAFE', color: '#1D4ED8', label: 'En ruta' }
            case 'entregado':
                return { bg: '#DCFCE7', color: '#166534', label: 'Entregado' }
            case 'cancelado':
                return { bg: '#E5E7EB', color: '#4B5563', label: 'Cancelado' }
            default:
                return { bg: '#E5E7EB', color: '#4B5563', label: estado || 'Pendiente' }
        }
    }

    React.useEffect(() => {
        loadData()
    }, [loadData])

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                userName={userName}
                role="SUPERVISOR"
                variant="home"
                rightElement={<SupervisorHeaderMenu />}
            />

            <ScrollView
                className="flex-1 px-4 pt-4"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={loadData} colors={[BRAND_COLORS.red]} />
                }
            >
                <View className="flex-row justify-between mb-6 -mx-1.5">
                    {kpis.map((kpi, index) => (
                        <DashboardCard
                            key={index}
                            label={kpi.label}
                            value={kpi.value}
                            icon={kpi.icon}
                            color={kpi.color}
                            columns={3}
                        />
                    ))}
                </View>

                <QuickActionsGrid />

                <View className="mt-6 mb-6">
                    <View className="flex-row items-center justify-between mb-3 px-1">
                        <Text className="text-base font-bold text-neutral-800">Pedidos Recientes</Text>
                        <Pressable onPress={() => navigation.navigate('SupervisorPedidos')}>
                            <Text className="text-sm font-semibold" style={{ color: BRAND_COLORS.red }}>Ver todos</Text>
                        </Pressable>
                    </View>

                    {recentOrders.length === 0 ? (
                        <View className="bg-white rounded-2xl p-6 items-center border border-neutral-200">
                            <Ionicons name="receipt-outline" size={40} color="#9CA3AF" />
                            <Text className="text-neutral-500 mt-2 text-center">
                                Aun no hay pedidos recientes
                            </Text>
                        </View>
                    ) : (
                        recentOrders.map((order) => {
                            const status = getOrderStatusStyle(order.estado)
                            return (
                                <Pressable
                                    key={order.id}
                                    onPress={() => navigation.navigate('SupervisorPedidoDetalle', { orderId: order.id })}
                                    className="bg-white rounded-2xl border border-neutral-200 p-4 mb-3"
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <Text className="text-sm font-bold text-neutral-900">
                                                Pedido #{order.numero_pedido || order.id.slice(0, 8)}
                                            </Text>
                                            <Text className="text-xs text-neutral-500 mt-1">
                                                {order.items?.length || 0} productos
                                            </Text>
                                        </View>
                                        <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: status.bg }}>
                                            <Text className="text-[10px] font-bold" style={{ color: status.color }}>
                                                {status.label.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center mt-3 pt-3 border-t border-neutral-100">
                                        <Text className="text-xs text-neutral-500 flex-1">
                                            {order.estado?.replace(/_/g, ' ') || 'pendiente'}
                                        </Text>
                                        <Text className="text-sm font-bold text-neutral-900">
                                            ${Number(order.total ?? 0).toFixed(2)}
                                        </Text>
                                    </View>
                                </Pressable>
                            )
                        })
                    )}
                </View>

                <View className="mb-24">
                    <Text className="text-lg font-bold text-neutral-800 mb-3 px-1">Alertas e Incidencias</Text>
                    {alerts.length > 0 ? (
                        alerts.map(alert => (
                            <View
                                key={alert.id}
                                className="bg-white p-4 rounded-xl border-l-4 mb-3 shadow-sm border-neutral-200"
                                style={{ borderLeftColor: alert.type === 'critical' ? BRAND_COLORS.red : BRAND_COLORS.gold }}
                            >
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1 mr-2">
                                        <Text className="font-bold text-neutral-800 text-base mb-1">
                                            {alert.type === 'critical' ? 'Atencion Requerida' : 'Advertencia'}
                                        </Text>
                                        <Text className="text-neutral-600 leading-snug text-sm">{alert.message}</Text>
                                    </View>
                                    <Text className="text-xs text-neutral-400 whitespace-nowrap">{alert.timestamp}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="bg-white p-8 rounded-xl border border-neutral-200 items-center justify-center border-dashed">
                            <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
                            <Text className="text-neutral-400 mt-2">No hay incidencias pendientes</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}
