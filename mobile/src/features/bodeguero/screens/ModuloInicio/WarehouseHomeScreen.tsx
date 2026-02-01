import React from 'react'
import { View, Text, ScrollView, Pressable, RefreshControl, StyleSheet } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

import { Header } from '../../../../components/ui/Header'
import { DashboardCard } from '../../../../components/ui/DashboardCard'
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
  { label: 'Validar Pedidos', icon: 'checkmark-circle-outline', color: BRAND_COLORS.red, route: 'Pedidos' },
  { label: 'Historial', icon: 'time-outline', color: '#F59E0B', route: 'Historial' },
]

export function WarehouseHomeScreen() {
  const navigation = useNavigation<any>()
  const [userName, setUserName] = React.useState('Bodeguero')
  const [loading, setLoading] = React.useState(false)
  const [pendingCount, setPendingCount] = React.useState(0)
  const [validatedCount, setValidatedCount] = React.useState(0)

  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [pending, orders] = await Promise.all([
        OrderService.getPendingValidationOrders(),
        OrderService.getOrders(),
      ])

      setPendingCount(pending.length)
      setValidatedCount(
        orders.filter((o: OrderListItem) => o.estado === 'validado' || o.estado === 'aceptado_cliente').length,
      )
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

  const navigateToTab = (tabName: string) => {
    const parent = navigation.getParent?.()
    if (parent?.getState?.().routeNames?.includes('WarehouseTabs')) {
      parent.navigate('WarehouseTabs', { screen: tabName })
      return
    }
    navigation.navigate(tabName)
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        userName={userName}
        role="BODEGUERO"
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
            colors={['#7F1D1D', '#991B1B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center mr-4">
                <Ionicons name="cube" size={28} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-white">¡Hola, {userName}!</Text>
                <Text className="text-sm text-red-100 mt-0.5">
                  Bodega en control
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

        {/* Urgent Alert */}
        {pendingCount > 0 && (
          <View className="px-4 mt-4">
            <Pressable
              onPress={() => navigateToTab('Pedidos')}
              className="rounded-2xl p-4 border border-red-200"
              style={{ backgroundColor: '#FEE2E2' }}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-red-100 items-center justify-center mr-3">
                  <Ionicons name="alert-circle" size={22} color={BRAND_COLORS.red} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-red-900">
                    {pendingCount} {pendingCount === 1 ? 'pedido pendiente' : 'pedidos pendientes'}
                  </Text>
                  <Text className="text-xs text-red-700 mt-0.5">
                    Requieren validacion urgente
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={BRAND_COLORS.red} />
              </View>
            </Pressable>
          </View>
        )}

        {/* KPIs */}
        <View className="px-4 mt-5">
          <Text className="text-base font-bold text-neutral-800 mb-3 px-1">Tu Resumen</Text>
          <View className="flex-row flex-wrap justify-between">
            <View style={{ width: '48%' }} className="mb-3">
              <DashboardCard
                label="Por Validar"
                value={pendingCount}
                icon="time-outline"
                color="#F59E0B"
              />
            </View>
            <View style={{ width: '48%' }} className="mb-3">
              <DashboardCard
                label="Validados"
                value={validatedCount}
                icon="checkmark-circle-outline"
                color="#10B981"
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
                onPress={() => navigateToTab(action.route)}
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

        {/* Info Section */}
        <View className="px-4 mt-4">
          <View className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={22} color="#2563EB" />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-blue-900">Flujo de trabajo</Text>
                <Text className="text-xs text-blue-700 mt-1">
                  1. Valida pedidos → 2. Prepara pickings → 3. Despacha entregas
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
  },
})
