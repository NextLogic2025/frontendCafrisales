import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ScrollScreen, Card, VStack, Text, Badge } from '@/components/ui'

interface TransportistaInicioScreenProps {
  userName: string
}

export function TransportistaInicioScreen({ userName }: TransportistaInicioScreenProps) {
  return (
    <ScrollScreen variant="withTabs">
      <VStack gap="md">
        {/* Tarjeta de bienvenida */}
        <Card variant="elevated">
          <VStack gap="sm">
            <Text variant="h3" weight="bold">
              Bienvenido, {userName}
            </Text>
            <Text variant="body" color="text-neutral-600">
              Rutas inteligentes, seguimiento de carga y notificaciones automáticas para cada entrega.
            </Text>
          </VStack>
        </Card>

        {/* Resumen rápido */}
        <Card variant="elevated">
          <Text variant="label" color="text-neutral-500" className="mb-3">
            ENTREGAS DEL DÍA
          </Text>
          <VStack gap="sm">
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-red/10 items-center justify-center">
                  <Ionicons name="navigate-outline" size={20} color="#F0412D" />
                </View>
                <Text variant="body">Pendientes</Text>
              </View>
              <Badge variant="warning">6</Badge>
            </View>

            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-red/10 items-center justify-center">
                  <Ionicons name="checkmark-done-outline" size={20} color="#F0412D" />
                </View>
                <Text variant="body">Completadas</Text>
              </View>
              <Badge variant="success">8</Badge>
            </View>

            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-red/10 items-center justify-center">
                  <Ionicons name="speedometer-outline" size={20} color="#F0412D" />
                </View>
                <Text variant="body">Km Recorridos</Text>
              </View>
              <Badge variant="info">45</Badge>
            </View>
          </VStack>
        </Card>

        {/* Acciones rápidas */}
        <Card variant="elevated">
          <Text variant="label" color="text-neutral-500" className="mb-3">
            ACCIONES RÁPIDAS
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <View className="flex-1 min-w-[140px] bg-cream rounded-xl p-4 items-center">
              <Ionicons name="map-outline" size={28} color="#F0412D" />
              <Text variant="bodySmall" align="center" className="mt-2">
                Ver Ruta
              </Text>
            </View>
            <View className="flex-1 min-w-[140px] bg-cream rounded-xl p-4 items-center">
              <Ionicons name="camera-outline" size={28} color="#F0412D" />
              <Text variant="bodySmall" align="center" className="mt-2">
                Confirmar Entrega
              </Text>
            </View>
          </View>
        </Card>
      </VStack>
    </ScrollScreen>
  )
}
