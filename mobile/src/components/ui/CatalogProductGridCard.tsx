import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BRAND_COLORS } from '../../services/shared/types'
import type { CatalogProduct } from '../../services/api/CatalogProductService'

type Props = {
  product: CatalogProduct
  categoryName?: string
  priceLabel?: string
  onPress: () => void
  onQuickAdd?: () => void
}

export function CatalogProductGridCard({ product, categoryName, priceLabel, onPress, onQuickAdd }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 bg-white rounded-3xl overflow-hidden border border-neutral-200"
      style={styles.card}
    >
      <View className="h-32 bg-neutral-100">
        {product.img_url ? (
          <Image source={{ uri: product.img_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View className="flex-1 items-center justify-center bg-neutral-100">
            <Ionicons name="image-outline" size={28} color="#9CA3AF" />
            <Text className="text-[11px] text-neutral-400 mt-2">Sin imagen</Text>
          </View>
        )}
      </View>

      <View className="px-4 py-3">
        <Text className="text-base font-bold text-neutral-900" numberOfLines={2}>
          {product.nombre}
        </Text>
        <Text className="text-xs text-neutral-500 mt-1" numberOfLines={1}>
          {categoryName ?? 'Catalogo general'}
        </Text>

        <View className="mt-3">
          {onQuickAdd ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation()
                onQuickAdd()
              }}
              className="py-2.5 rounded-xl bg-brand-red items-center"
            >
              <Text className="text-white text-xs font-bold">Agregar</Text>
            </Pressable>
          ) : (
            <View className="py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 flex-row items-center justify-center">
              <Text className="text-xs font-semibold text-neutral-600 mr-1">Ver detalle</Text>
              <Ionicons name="chevron-forward" size={14} color="#525252" />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
})
