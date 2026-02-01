import React from 'react'
import { View, Text, ScrollView, Pressable, RefreshControl, StyleSheet } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

import { Header } from '../../../../components/ui/Header'
import { ClientHeaderMenu } from '../../../../components/ui/ClientHeaderMenu'
import { getUserName } from '../../../../storage/authStorage'
import { OrderService, OrderListItem } from '../../../../services/api/OrderService'
import { BRAND_COLORS } from '../../../../shared/types'

type QuickAction = {
    label: string
    icon: string
    color: string
    route: string
}

const QUICK_ACTIONS: QuickAction[] = [
    { label: 'Ver Productos', icon: 'storefront-outline', color: BRAND_COLORS.red, route: 'Productos' },
    { label: 'Mis Pedidos', icon: 'receipt-outline', color: '#6366F1', route: 'ClientePedidos' },
    { label: 'Mis Creditos', icon: 'card-outline', color: '#F59E0B', route: 'ClienteCreditos' },
]

export function ClientHomeScreen() {
    const navigation = useNavigation<any>()
    const [userName, setUserName] = React.useState('Cliente')
    const [loading, setLoading] = React.useState(false)
    const [recentOrders, setRecentOrders] = React.useState<OrderListItem[]>([])

    const loadData = React.useCallback(async () => {
        setLoading(true)
        try {
            // Use getMyOrders for client role (clients don't have access to getOrders)
            const ordersData = await OrderService.getMyOrders()
            // Get last 3 orders
            setRecentOrders(ordersData.slice(0, 3))
            // Filter for active deliveries from order states
            // Note: Clients can't access DeliveryService directly, so we derive from orders
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
            if (!name) return
            const normalized = name.includes('@') ? name.split('@')[0] : name
            setUserName(normalized)
        })
    }, [])

    const getOrderStatusStyle = (estado: string) => {
        switch (estado) {
            case 'PENDIENTE':
                return { bg: '#FEF3C7', color: '#92400E', label: 'Pendiente' }
            case 'EN_REVISION':
                return { bg: '#DBEAFE', color: '#1D4ED8', label: 'En revision' }
            case 'APROBADO':
                return { bg: '#DCFCE7', color: '#166534', label: 'Aprobado' }
            case 'RECHAZADO':
                return { bg: '#FEE2E2', color: '#991B1B', label: 'Rechazado' }
            case 'EN_PREPARACION':
                return { bg: '#E0E7FF', color: '#4338CA', label: 'Preparando' }
            case 'DESPACHADO':
                return { bg: '#D1FAE5', color: '#047857', label: 'Despachado' }
            default:
                return { bg: '#E5E7EB', color: '#4B5563', label: estado }
        }
    }

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                userName={userName}
                role="CLIENTE"
                variant="home"
                showNotification
                rightElement={<ClientHeaderMenu />}
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
                                <Ionicons name="sparkles" size={28} color={BRAND_COLORS.red} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-neutral-900">Bienvenido a Cafrilosa</Text>
                                <Text className="text-sm text-neutral-600 mt-0.5">
                                    Tu plataforma de compras directas
                                </Text>
                            </View>
                        </View>
                        <View className="mt-4 bg-white/80 rounded-xl p-3 border border-red-100">
                            <View className="flex-row items-center">
                                <Ionicons name="time-outline" size={18} color={BRAND_COLORS.red} />
                                <Text className="text-sm text-neutral-700 ml-2 flex-1">
                                    Realiza tus pedidos y recibelos directamente en tu negocio
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Quick Actions */}
                <View className="px-4 mt-5">
                    <Text className="text-base font-bold text-neutral-800 mb-3 px-1">Accesos Rapidos</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {QUICK_ACTIONS.map((action, index) => (
                            <Pressable
                                key={index}
                                className="bg-white p-4 rounded-2xl border border-neutral-200 mb-3 shadow-sm items-center justify-center"
                                style={{ width: '48%' }}
                                onPress={() => navigation.navigate(action.route)}
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
                <View className="px-4 mt-5">
                    <View className="flex-row items-center justify-between mb-3 px-1">
                        <Text className="text-base font-bold text-neutral-800">Pedidos Recientes</Text>
                        <Pressable onPress={() => navigation.navigate('ClientePedidos')}>
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
                                onPress={() => navigation.navigate('Productos')}
                                className="mt-3 px-4 py-2 rounded-full"
                                style={{ backgroundColor: BRAND_COLORS.red }}
                            >
                                <Text className="text-white font-semibold text-sm">Explorar Productos</Text>
                            </Pressable>
                        </View>
                    ) : (
                        recentOrders.map((order) => {
                            const status = getOrderStatusStyle(order.estado || 'PENDIENTE')
                            return (
                                <Pressable
                                    key={order.id}
                                    onPress={() => navigation.navigate('ClientePedidoDetalle', { orderId: order.id })}
                                    className="bg-white rounded-2xl border border-neutral-200 p-4 mb-3"
                                    style={styles.card}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <Text className="text-sm font-bold text-neutral-900">
                                                Pedido #{order.numero_pedido || order.id.slice(0, 8)}
                                            </Text>
                                            <Text className="text-xs text-neutral-500 mt-1">
                                                {(order.estado || 'Pendiente').replace(/_/g, ' ')}
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

                {/* Info Section */}
                <View className="px-4 mt-4">
                    <View className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                        <View className="flex-row items-start">
                            <Ionicons name="information-circle" size={22} color="#D97706" />
                            <View className="ml-3 flex-1">
                                <Text className="text-sm font-semibold text-amber-900">Atencion al Cliente</Text>
                                <Text className="text-xs text-amber-700 mt-1">
                                    Si tienes dudas sobre tu pedido o entrega, contactanos por WhatsApp o llamanos a nuestro centro de atencion.
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
