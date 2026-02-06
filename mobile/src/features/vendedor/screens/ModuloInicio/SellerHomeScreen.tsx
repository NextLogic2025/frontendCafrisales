import React from 'react'
import { View, Text, ScrollView, Pressable, RefreshControl, StyleSheet } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { jwtDecode } from 'jwt-decode'

import { Header } from '../../../../components/ui/Header'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { DashboardCard } from '../../../../components/ui/DashboardCard'
import { getUserName } from '../../../../storage/authStorage'
import { OrderService, OrderListItem } from '../../../../services/api/OrderService'
import { BRAND_COLORS } from '../../../../shared/types'
import { getValidToken } from '../../../../services/auth/authClient'

type QuickAction = {
    label: string
    icon: string
    color: string
    route: string
    params?: object
}

const QUICK_ACTIONS: QuickAction[] = [
    { label: 'Nuevo Pedido', icon: 'add-circle-outline', color: BRAND_COLORS.red, route: 'Productos' },
    { label: 'Mis Clientes', icon: 'people-outline', color: '#6366F1', route: 'Clientes' },
    { label: 'Mi Rutero', icon: 'navigate-outline', color: '#10B981', route: 'SellerRuterosComerciales' },
    { label: 'Creditos', icon: 'card-outline', color: '#F59E0B', route: 'Creditos' },
]

export function SellerHomeScreen() {
    const navigation = useNavigation<any>()
    const [userName, setUserName] = React.useState('Vendedor')
    const [loading, setLoading] = React.useState(false)
    const [orders, setOrders] = React.useState<OrderListItem[]>([])

    const loadData = React.useCallback(async () => {
        setLoading(true)
        try {
            const token = await getValidToken()
            if (!token) {
                setOrders([])
                return
            }
            const decoded = jwtDecode<{ sub?: string; userId?: string }>(token)
            const vendedorId = decoded.sub || decoded.userId
            const ordersData = await OrderService.getOrders()
            if (!vendedorId) {
                setOrders(ordersData)
                return
            }
            const visibleOrders = ordersData.filter((order) => {
                const createdByMe = (order as any).creado_por_id === vendedorId || (order as any).creado_por === vendedorId
                const vendedorMatch = (order as any).vendedor_id === vendedorId
                return createdByMe || vendedorMatch
            })
            setOrders(visibleOrders)
        } catch {
            // Silently fail
        } finally {
            setLoading(false)
        }
    }, [])

    useFocusEffect(
        React.useCallback(() => {
            loadData()
        }, [loadData])
    )

    React.useEffect(() => {
        getUserName().then(name => {
            if (name) setUserName(name)
        })
    }, [])

    // Calculate KPIs
    const kpis = React.useMemo(() => {
        const today = new Date().toDateString()
        const todayOrders = orders.filter(o => {
            const orderDate = o.creado_en ? new Date(o.creado_en).toDateString() : ''
            return orderDate === today
        })
        const pendientes = orders.filter(o => o.estado === 'pendiente_validacion' || o.estado === 'ajustado_bodega').length
        const aprobados = orders.filter(o => o.estado === 'validado' || o.estado === 'aceptado_cliente').length
        const totalVentasHoy = todayOrders.reduce((acc, o) => acc + Number(o.total ?? 0), 0)
        return { pedidosHoy: todayOrders.length, pendientes, aprobados, totalVentasHoy }
    }, [orders])

    const recentOrders = React.useMemo(() => {
        return orders.slice(0, 3)
    }, [orders])

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

    const navigateToTab = (tabName: string) => {
        const parent = navigation.getParent?.()
        if (parent?.getState?.().routeNames?.includes('SellerTabs')) {
            parent.navigate('SellerTabs', { screen: tabName })
            return
        }
        navigation.navigate(tabName)
    }

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                userName={userName}
                role="VENDEDOR"
                variant="home"
                showNotification
                rightElement={<SellerHeaderMenu />}
            />

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={[BRAND_COLORS.red]} />}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Welcome Hero */}
                <View className="px-4 pt-4">
                    <LinearGradient
                        colors={['#FEF2F2', '#FFFFFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View className="flex-row items-center">
                            <View className="w-14 h-14 rounded-2xl bg-red-100 items-center justify-center mr-4">
                                <Ionicons name="trending-up" size={28} color={BRAND_COLORS.red} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-neutral-900">¡Hola, {userName}!</Text>
                                <Text className="text-sm text-neutral-600 mt-0.5">
                                    Listo para vender hoy
                                </Text>
                            </View>
                        </View>
                        <View className="mt-4 bg-white/80 rounded-xl p-3 border border-red-100">
                            <View className="flex-row items-center">
                                <Ionicons name="calendar-outline" size={18} color={BRAND_COLORS.red} />
                                <Text className="text-sm text-neutral-700 ml-2 flex-1">
                                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* KPIs */}
                <View className="px-4 mt-5">
                    <Text className="text-base font-bold text-neutral-800 mb-3 px-1">Tu Resumen</Text>
                    <View className="flex-row flex-wrap justify-between">
                        <View style={{ width: '48%' }} className="mb-3">
                            <DashboardCard
                                label="Pedidos Hoy"
                                value={kpis.pedidosHoy}
                                icon="receipt-outline"
                                color="#6366F1"
                            />
                        </View>
                        <View style={{ width: '48%' }} className="mb-3">
                            <DashboardCard
                                label="Pendientes"
                                value={kpis.pendientes}
                                icon="time-outline"
                                color="#F59E0B"
                            />
                        </View>
                        <View style={{ width: '48%' }} className="mb-3">
                            <DashboardCard
                                label="Aprobados"
                                value={kpis.aprobados}
                                icon="checkmark-circle-outline"
                                color="#10B981"
                            />
                        </View>
                        <View style={{ width: '48%' }} className="mb-3">
                            <DashboardCard
                                label="Ventas Hoy"
                                value={`$${Number(kpis.totalVentasHoy).toFixed(0)}`}
                                icon="cash-outline"
                                color={BRAND_COLORS.red}
                            />
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="px-4 mt-4">
                    <Text className="text-base font-bold text-neutral-800 mb-3 px-1">Accesos Rapidos</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {QUICK_ACTIONS.map((action, index) => (
                            <Pressable
                                key={index}
                                className="bg-white p-4 rounded-2xl border border-neutral-200 mb-3 shadow-sm items-center justify-center"
                                style={{ width: '48%' }}
                                onPress={() => {
                                    if (action.route === 'Productos' || action.route === 'Clientes') {
                                        navigateToTab(action.route)
                                    } else {
                                        navigation.navigate(action.route, action.params)
                                    }
                                }}
                                android_ripple={{ color: '#00000010' }}
                            >
                                <View
                                    className="w-12 h-12 rounded-xl items-center justify-center mb-2"
                                    style={{ backgroundColor: `${action.color}15` }}
                                >
                                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                                </View>
                                <Text className="text-sm font-semibold text-neutral-700">{action.label}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Recent Orders */}
                <View className="px-4 mt-4">
                    <View className="flex-row items-center justify-between mb-3 px-1">
                        <Text className="text-base font-bold text-neutral-800">Pedidos Recientes</Text>
                        <Pressable onPress={() => navigation.navigate('SellerPedidos')}>
                            <Text className="text-sm font-semibold" style={{ color: BRAND_COLORS.red }}>Ver todos</Text>
                        </Pressable>
                    </View>

                    {recentOrders.length === 0 ? (
                        <View className="bg-white rounded-2xl p-6 items-center border border-neutral-200">
                            <Ionicons name="receipt-outline" size={40} color="#9CA3AF" />
                            <Text className="text-neutral-500 mt-2 text-center">
                                Aun no tienes pedidos
                            </Text>
                            <Pressable
                                onPress={() => navigateToTab('Productos')}
                                className="mt-3 px-4 py-2 rounded-full"
                                style={{ backgroundColor: BRAND_COLORS.red }}
                            >
                                <Text className="text-white font-semibold text-sm">Crear Pedido</Text>
                            </Pressable>
                        </View>
                    ) : (
                        recentOrders.map((order) => {
                            const status = getOrderStatusStyle(order.estado)
                            return (
                                <Pressable
                                    key={order.id}
                                    onPress={() => navigation.navigate('SellerPedidoDetalle', { orderId: order.id })}
                                    className="bg-white rounded-2xl border border-neutral-200 p-4 mb-3"
                                    style={styles.card}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <Text className="text-sm font-bold text-neutral-900">
                                                Pedido #{order.numero_pedido || order.id.slice(0, 8)}
                                            </Text>
                                            <Text className="text-xs text-neutral-500 mt-0.5">
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
                                            {order.items?.length || 0} productos
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

                {/* Tips Section */}
                <View className="px-4 mt-4">
                    <View className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                        <View className="flex-row items-start">
                            <Ionicons name="bulb-outline" size={22} color="#2563EB" />
                            <View className="ml-3 flex-1">
                                <Text className="text-sm font-semibold text-blue-900">Tip del dia</Text>
                                <Text className="text-xs text-blue-700 mt-1">
                                    Revisa tu rutero para planificar tus visitas y maximizar tus ventas del dia.
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    heroCard: {
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },
})
