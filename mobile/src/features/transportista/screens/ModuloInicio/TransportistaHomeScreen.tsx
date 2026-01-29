import React from 'react'
import { View, Text, ScrollView, Pressable, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

import { Header } from '../../../../components/ui/Header'
import { DashboardCard } from '../../../../components/ui/DashboardCard'
import { UserService } from '../../../../services/api/UserService'
import { DeliveryService } from '../../../../services/api/DeliveryService'
import { BRAND_COLORS } from '../../../../shared/types'

type QuickAction = {
    label: string
    icon: string
    color: string
    route: string
}

const QUICK_ACTIONS: QuickAction[] = [
    { label: 'Mis Rutas', icon: 'map-outline', color: BRAND_COLORS.red, route: 'Rutas' },
    { label: 'Mis Entregas', icon: 'cube-outline', color: '#6366F1', route: 'Entregas' },
]

export function TransportistaHomeScreen() {
    const navigation = useNavigation<any>()
    const [userName, setUserName] = React.useState('Transportista')
    const [loading, setLoading] = React.useState(false)

    // KPIs
    const [entregasHoy, setEntregasHoy] = React.useState(0)
    const [pendientes, setPendientes] = React.useState(0)
    const [completadas, setCompletadas] = React.useState(0)
    const [noEntregadas, setNoEntregadas] = React.useState(0)

    const loadData = React.useCallback(async () => {
        setLoading(true)
        try {
            // 1. Get User Profile to ID
            const profile = await UserService.getProfile()
            if (profile?.name) setUserName(profile.name)

            if (profile?.id) {
                // 2. Get Deliveries for today (or all active)
                // For now, let's fetch all active deliveries to show relevant workload
                // We could filter by date if we had a date picker, but "Today" is usually implied for Transporters
                const today = new Date().toISOString().split('T')[0]
                const deliveries = await DeliveryService.getDeliveries({
                    transportista_id: profile.id,
                    fecha: today
                })

                setEntregasHoy(deliveries.length)
                setPendientes(deliveries.filter(d => d.estado === 'pendiente' || d.estado === 'en_ruta').length)
                setCompletadas(deliveries.filter(d => d.estado === 'entregado_completo' || d.estado === 'entregado_parcial').length)
                setNoEntregadas(deliveries.filter(d => d.estado === 'no_entregado').length)
            }
        } catch (e) {
            console.error('Error loading transportista dashboard:', e)
        } finally {
            setLoading(false)
        }
    }, [])

    useFocusEffect(
        React.useCallback(() => {
            loadData()
        }, [loadData])
    )

    const navigateToTab = (tabName: string) => {
        // Navigate to the tab using the parent navigator if possible, specifically for nested navigators
        navigation.navigate(tabName)
    }

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                userName={userName}
                role="TRANSPORTISTA"
                variant="home"
                showNotification
            />

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={[BRAND_COLORS.red]} />}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Welcome Hero */}
                <View className="px-4 pt-4">
                    <LinearGradient
                        colors={[BRAND_COLORS.red, '#991B1B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View className="flex-row items-center">
                            <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center mr-4">
                                <Ionicons name="bus-outline" size={28} color="#FFFFFF" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-white">Ruta en progreso</Text>
                                <Text className="text-sm text-red-100 mt-0.5">
                                    Transporte activo
                                </Text>
                            </View>
                        </View>
                        <View className="mt-4 bg-white/15 rounded-xl p-3">
                            <View className="flex-row items-center">
                                <Ionicons name="calendar-outline" size={18} color="#FECACA" />
                                <Text className="text-sm text-red-100 ml-2 flex-1">
                                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Status Alert */}
                {pendientes > 0 ? (
                    <View className="px-4 mt-4">
                        <Pressable
                            onPress={() => navigateToTab('Entregas')}
                            className="rounded-2xl p-4 border border-blue-200 bg-blue-50"
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center mr-3">
                                    <Ionicons name="time-outline" size={22} color="#2563EB" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-blue-900">
                                        {pendientes} {pendientes === 1 ? 'entrega pendiente' : 'entregas pendientes'}
                                    </Text>
                                    <Text className="text-xs text-blue-700 mt-0.5">
                                        Tienes trabajo por completar hoy
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#2563EB" />
                            </View>
                        </Pressable>
                    </View>
                ) : entregasHoy > 0 && completadas === entregasHoy ? (
                    <View className="px-4 mt-4">
                        <View className="rounded-2xl p-4 border border-green-200 bg-green-50">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center mr-3">
                                    <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-green-900">
                                        ¡Todo listo por hoy!
                                    </Text>
                                    <Text className="text-xs text-green-700 mt-0.5">
                                        Has completado todas tus entregas
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : null}

                {/* KPIs */}
                <View className="px-4 mt-5">
                    <Text className="text-base font-bold text-neutral-800 mb-3 px-1">Resumen del Día</Text>
                    <View className="flex-row flex-wrap justify-between">
                        <View style={{ width: '48%' }} className="mb-3">
                            <DashboardCard
                                label="Total Hoy"
                                value={entregasHoy}
                                icon="list-outline"
                                color={BRAND_COLORS.red}
                            />
                        </View>
                        <View style={{ width: '48%' }} className="mb-3">
                            <DashboardCard
                                label="Pendientes"
                                value={pendientes}
                                icon="time-outline"
                                color="#6366F1"
                            />
                        </View>
                        <View style={{ width: '48%' }} className="mb-3">
                            <DashboardCard
                                label="Entregados"
                                value={completadas}
                                icon="checkmark-circle-outline"
                                color="#10B981"
                            />
                        </View>
                        <View style={{ width: '48%' }} className="mb-3">
                            <DashboardCard
                                label="No Entregados"
                                value={noEntregadas}
                                icon="close-circle-outline"
                                color="#EF4444"
                            />
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="px-4 mt-4">
                    <Text className="text-base font-bold text-neutral-800 mb-3 px-1">Acciones Rápidas</Text>
                    <View className="flex-row overflow-visible gap-3">
                        {QUICK_ACTIONS.map((action, index) => (
                            <Pressable
                                key={index}
                                className="bg-white p-4 rounded-2xl border border-neutral-200 mb-3 shadow-sm items-center justify-center flex-1"
                                onPress={() => navigateToTab(action.route)}
                                android_ripple={{ color: '#00000010' }}
                            >
                                <View
                                    className="w-12 h-12 rounded-xl items-center justify-center mb-2"
                                    style={{ backgroundColor: `${action.color}15` }}
                                >
                                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                                </View>
                                <Text className="text-sm font-semibold text-neutral-700 text-center">{action.label}</Text>
                            </Pressable>
                        ))}
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
    },
})
