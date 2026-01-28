import React from 'react'
import { View, Text } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Header } from '../../../../components/ui/Header'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { getUserName } from '../../../../storage/authStorage'
import { OrderService } from '../../../../services/api/OrderService'

export function WarehouseHomeScreen() {
  const navigation = useNavigation<any>()
  const [userName, setUserName] = React.useState('Bodeguero')
  const [pendingCount, setPendingCount] = React.useState(0)
  const [validatedCount, setValidatedCount] = React.useState(0)
  const [adjustedCount, setAdjustedCount] = React.useState(0)

  const loadStats = React.useCallback(async () => {
    const pending = await OrderService.getPendingValidationOrders()
    setPendingCount(pending.length)
    const all = await OrderService.getOrders()
    const validated = all.filter((order) => order.estado === 'validado')
    const adjusted = all.filter((order) => order.estado === 'ajustado_bodega')
    setValidatedCount(validated.length)
    setAdjustedCount(adjusted.length)
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      getUserName().then(name => {
        if (name) setUserName(name)
      })
      loadStats()
    }, [loadStats]),
  )

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        userName={userName}
        role="BODEGUERO"
        variant="home"
        showNotification={false}
      />

      <View className="flex-1 px-6 pt-6">
        <LinearGradient
          colors={['#111827', '#1F2937']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 24, padding: 20 }}
        >
          <Text className="text-xs text-neutral-300">Resumen de hoy</Text>
          <Text className="text-2xl font-extrabold text-white mt-2">Bodega en control</Text>
          <Text className="text-xs text-neutral-400 mt-2">
            Revisa pedidos pendientes y valida en un solo paso.
          </Text>
        </LinearGradient>

        <View className="flex-row gap-3 mt-5">
          <View className="flex-1 bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-neutral-500">Pendientes</Text>
              <Ionicons name="time-outline" size={18} color="#F59E0B" />
            </View>
            <Text className="text-2xl font-extrabold text-neutral-900 mt-2">{pendingCount}</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-neutral-500">Validados</Text>
              <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
            </View>
            <Text className="text-2xl font-extrabold text-neutral-900 mt-2">{validatedCount}</Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm mt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-neutral-500">Ajustados hoy</Text>
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
          </View>
          <Text className="text-2xl font-extrabold text-neutral-900 mt-2">{adjustedCount}</Text>
          <Text className="text-xs text-neutral-500 mt-1">
            Pedidos que requieren aceptación del cliente.
          </Text>
        </View>

        <View className="mt-6">
          <PrimaryButton title="Ver pedidos pendientes" onPress={() => navigation.navigate('Pedidos')} />
        </View>
      </View>
    </View>
  )
}
