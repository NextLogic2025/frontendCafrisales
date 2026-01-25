import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ScrollScreen, Card, VStack, Text, Badge } from '@/components/ui'

interface BodegueroInicioScreenProps {
  userName: string
}

export function BodegueroInicioScreen({ userName }: BodegueroInicioScreenProps) {
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
              Sigue el inventario, ubicaciones y ciclos de picking sin tener que volver al escritorio.
            </Text>
          </VStack>
        </Card>

        {/* Resumen rápido */}
        <Card variant="elevated">
          <Text variant="label" color="text-neutral-500" className="mb-3">
            ESTADO DE BODEGA
          </Text>
          <VStack gap="sm">
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-red/10 items-center justify-center">
                  <Ionicons name="cube-outline" size={20} color="#F0412D" />
                </View>
                <Text variant="body">Pedidos por Preparar</Text>
              </View>
              <Badge variant="warning">7</Badge>
            </View>

            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-red/10 items-center justify-center">
                  <Ionicons name="checkmark-circle-outline" size={20} color="#F0412D" />
                </View>
                <Text variant="body">Listos para Envío</Text>
              </View>
              <Badge variant="success">12</Badge>
            </View>

            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-red/10 items-center justify-center">
                  <Ionicons name="warning-outline" size={20} color="#F0412D" />
                </View>
                <Text variant="body">Alertas de Stock</Text>
              </View>
              <Badge variant="danger">3</Badge>
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
              <Ionicons name="scan-outline" size={28} color="#F0412D" />
              <Text variant="bodySmall" align="center" className="mt-2">
                Escanear
              </Text>
            </View>
            <View className="flex-1 min-w-[140px] bg-cream rounded-xl p-4 items-center">
              <Ionicons name="list-outline" size={28} color="#F0412D" />
              <Text variant="bodySmall" align="center" className="mt-2">
                Inventario
              </Text>
            </View>
          </View>
        </Card>
      </VStack>
    </ScrollScreen>
  )
}
