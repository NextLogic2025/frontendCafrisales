import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { GenericModal } from '../ui/GenericModal'
import { PrimaryButton } from '../ui/PrimaryButton'
import { BRAND_COLORS } from '../../shared/types'
import type { CatalogProductSku } from '../../services/api/CatalogProductService'

type Props = {
  visible: boolean
  title: string
  skus: CatalogProductSku[]
  selectedSkuId?: string | null
  quantity: number
  onSelectSku: (skuId: string) => void
  onQuantityChange: (quantity: number) => void
  onClose: () => void
  onConfirm: () => void
}

export function SkuPickerModal({
  visible,
  title,
  skus,
  selectedSkuId,
  quantity,
  onSelectSku,
  onQuantityChange,
  onClose,
  onConfirm,
}: Props) {
  const resolvedQuantity = Math.max(1, quantity)

  const formatPrice = (sku: CatalogProductSku) => {
    const current = sku.precios?.find((price) => !price.vigente_hasta) ?? sku.precios?.[0]
    const parsed = current ? Number(current.precio) : NaN
    if (!current || !Number.isFinite(parsed)) return 'Precio a confirmar'
    return `${current.moneda} ${parsed.toFixed(2)}`
  }

  return (
    <GenericModal visible={visible} title={title} onClose={onClose}>
      <View>
        <View className="gap-3 mb-5">
          {skus.map((sku) => {
            const isSelected = selectedSkuId === sku.id
            return (
              <TouchableOpacity
                key={sku.id}
                onPress={() => onSelectSku(sku.id)}
                className="p-4 rounded-2xl border-2"
                style={{
                  borderColor: isSelected ? BRAND_COLORS.red : '#E5E7EB',
                  backgroundColor: isSelected ? '#FEF2F2' : '#FFFFFF',
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="text-sm font-bold text-neutral-900">{sku.nombre}</Text>
                    <Text className="text-xs text-neutral-500 mt-1">{sku.codigo_sku}</Text>
                    <View className="flex-row items-center gap-2 mt-2">
                      <View className="px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200">
                        <Text className="text-[10px] text-neutral-700">{sku.peso_gramos} g</Text>
                      </View>
                      <View className="px-2.5 py-1 rounded-full bg-red-50 border border-red-100">
                        <Text className="text-[10px] font-semibold text-red-600">{formatPrice(sku)}</Text>
                      </View>
                    </View>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={22} color={BRAND_COLORS.red} />}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        <View className="bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 mb-5">
          <Text className="text-xs text-neutral-500 font-semibold">Cantidad</Text>
          <View className="flex-row items-center mt-2">
            <TouchableOpacity
              onPress={() => onQuantityChange(Math.max(1, resolvedQuantity - 1))}
              className="w-10 h-10 rounded-xl bg-white border border-neutral-200 items-center justify-center"
            >
              <Ionicons name="remove" size={18} color={BRAND_COLORS.red} />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-lg font-bold text-neutral-900">{resolvedQuantity}</Text>
            <TouchableOpacity
              onPress={() => onQuantityChange(resolvedQuantity + 1)}
              className="w-10 h-10 rounded-xl bg-white border border-neutral-200 items-center justify-center"
            >
              <Ionicons name="add" size={18} color={BRAND_COLORS.red} />
            </TouchableOpacity>
          </View>
        </View>

        <PrimaryButton title="Agregar al carrito" onPress={onConfirm} />
      </View>
    </GenericModal>
  )
}
