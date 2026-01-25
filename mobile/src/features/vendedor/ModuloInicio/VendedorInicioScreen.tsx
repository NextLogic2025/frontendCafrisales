import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ScrollScreen, Card, VStack, Text, Badge } from '@/components/ui'

interface VendedorInicioScreenProps {
  userName: string
}

export function VendedorInicioScreen({ userName }: VendedorInicioScreenProps) {
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
              Accede a catálogos dinámicos y cotizaciones personalizadas con indicadores en vivo.
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
                  <Ionicons name="cart-outline" size={20} color="#F0412D" />
                </View>
                <Text variant="body">Pedidos Hoy</Text>
              </View>
              <Badge variant="success">8</Badge>
            </View>

            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-red/10 items-center justify-center">
                  <Ionicons name="trending-up-outline" size={20} color="#F0412D" />
                </View>
                <Text variant="body">Meta del Mes</Text>
              </View>
              <Badge variant="info">78%</Badge>
            </View>

            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-red/10 items-center justify-center">
                  <Ionicons name="people-outline" size={20} color="#F0412D" />
                </View>
                <Text variant="body">Clientes Activos</Text>
              </View>
              <Badge variant="primary">24</Badge>
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
              <Ionicons name="add-circle-outline" size={28} color="#F0412D" />
              <Text variant="bodySmall" align="center" className="mt-2">
                Nuevo Pedido
              </Text>
            </View>
            <View className="flex-1 min-w-[140px] bg-cream rounded-xl p-4 items-center">
              <Ionicons name="pricetag-outline" size={28} color="#F0412D" />
              <Text variant="bodySmall" align="center" className="mt-2">
                Catálogo
              </Text>
            </View>
          </View>
        </Card>
      </VStack>
    </ScrollScreen>
  )
}
