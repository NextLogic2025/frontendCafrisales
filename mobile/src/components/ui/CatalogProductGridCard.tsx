import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BRAND_COLORS } from '../../shared/types'
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

        <View className="flex-row items-center mt-3">
          <View className="flex-1 mr-2">
            <View className="px-2.5 py-1 rounded-full border border-red-100 bg-red-50">
              <Text className="text-[11px] font-semibold text-red-600" numberOfLines={1} ellipsizeMode="tail">
                {priceLabel ?? 'Precio a confirmar'}
              </Text>
            </View>
          </View>
          {onQuickAdd ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation()
                onQuickAdd()
              }}
              className="px-3 py-2 rounded-xl bg-brand-red"
              style={{ minWidth: 72, alignItems: 'center' }}
            >
              <Text className="text-white text-[11px] font-bold">Agregar</Text>
            </Pressable>
          ) : (
            <View className="w-8 h-8 rounded-full items-center justify-center bg-neutral-100 border border-neutral-200">
              <Ionicons name="chevron-forward" size={16} color={BRAND_COLORS.red} />
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
