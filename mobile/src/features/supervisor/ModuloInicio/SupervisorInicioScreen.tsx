import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ScrollScreen, Card, VStack, Text, Badge } from '@/components/ui'

interface SupervisorInicioScreenProps {
  userName: string
}

export function SupervisorInicioScreen({ userName }: SupervisorInicioScreenProps) {
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
              Panel de control con métricas clave, alertas y seguimiento de rendimiento en tiempo real.
            </Text>
          </VStack>
        </Card>

        {/* Resumen rápido */}
        <Card variant="elevated">
          <Text variant="label" color="text-neutral-500" className="mb-3">
            RESUMEN DEL DÍA
          </Text>
          <VStack gap="sm">
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-red/10 items-center justify-center">
                  <Ionicons name="people-outline" size={20} color="#F0412D" />
                </View>
                <Text variant="body">Equipo Activo</Text>
              </View>
              <Badge variant="success">12</Badge>
            </View>

            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-red/10 items-center justify-center">
                  <Ionicons name="checkmark-circle-outline" size={20} color="#F0412D" />
                </View>
                <Text variant="body">Aprobaciones Pendientes</Text>
              </View>
              <Badge variant="warning">5</Badge>
            </View>

            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-red/10 items-center justify-center">
                  <Ionicons name="stats-chart-outline" size={20} color="#F0412D" />
                </View>
                <Text variant="body">Rendimiento General</Text>
              </View>
              <Badge variant="info">94%</Badge>
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
              <Ionicons name="document-text-outline" size={28} color="#F0412D" />
              <Text variant="bodySmall" align="center" className="mt-2">
                Ver Reportes
              </Text>
            </View>
            <View className="flex-1 min-w-[140px] bg-cream rounded-xl p-4 items-center">
              <Ionicons name="notifications-outline" size={28} color="#F0412D" />
              <Text variant="bodySmall" align="center" className="mt-2">
                Alertas
              </Text>
            </View>
          </View>
        </Card>
      </VStack>
    </ScrollScreen>
  )
}
