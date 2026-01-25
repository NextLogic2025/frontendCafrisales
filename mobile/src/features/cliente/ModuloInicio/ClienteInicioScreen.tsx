import React from 'react'
import { View, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ScrollScreen, Card, VStack, Text } from '@/components/ui'

interface ClienteInicioScreenProps {
  userName: string
}

export function ClienteInicioScreen({ userName }: ClienteInicioScreenProps) {
  return (
    <ScrollScreen variant="withTabs">
      <VStack gap="md">
        {/* Resumen rápido */}
        <Card variant="elevated">
          <Text variant="label" color="text-neutral-500" className="mb-3">
            MIS PEDIDOS
          </Text>
          <VStack gap="xs">
            <StatRow
              icon="time-outline"
              label="En Proceso"
              value="--"
            />
            <StatRow
              icon="car-outline"
              label="En Camino"
              value="--"
            />
            <StatRow
              icon="checkmark-done-outline"
              label="Entregados"
              value="--"
            />
          </VStack>
        </Card>

        {/* Acciones rápidas */}
        <Card variant="elevated">
          <Text variant="label" color="text-neutral-500" className="mb-3">
            ACCIONES RÁPIDAS
          </Text>
          <View className="flex-row gap-3">
            <ActionButton icon="add-circle-outline" label="Nuevo Pedido" />
            <ActionButton icon="receipt-outline" label="Historial" />
          </View>
        </Card>
      </VStack>
    </ScrollScreen>
  )
}

function StatRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-2.5 border-b border-neutral-100 last:border-b-0">
      <View className="flex-row items-center gap-3">
        <View className="w-9 h-9 rounded-full bg-red/10 items-center justify-center">
          <Ionicons name={icon} size={18} color="#F0412D" />
        </View>
        <Text variant="body" color="text-neutral-700">{label}</Text>
      </View>
      <Text variant="body" weight="semibold" color="text-neutral-400">{value}</Text>
    </View>
  )
}

function ActionButton({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <Pressable className="flex-1 bg-neutral-50 rounded-xl p-4 items-center border border-neutral-100">
      <Ionicons name={icon} size={26} color="#F0412D" />
      <Text variant="bodySmall" align="center" color="text-neutral-700" className="mt-2">
        {label}
      </Text>
    </Pressable>
  )
}
