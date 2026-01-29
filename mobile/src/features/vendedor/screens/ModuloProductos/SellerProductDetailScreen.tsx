import React from 'react'
import { Image, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../components/ui/Header'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { EmptyState } from '../../../../components/ui/EmptyState'
import { PrimaryButton } from '../../../../components/ui/PrimaryButton'
import { BRAND_COLORS } from '../../../../services/shared/types'
import { CatalogProduct, CatalogProductService } from '../../../../services/api/CatalogProductService'
import { SkuPickerModal } from '../../../../components/catalog/SkuPickerModal'
import { useCart } from '../../../../context/CartContext'
import { showGlobalToast } from '../../../../utils/toastService'

export function SellerProductDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const productParam: CatalogProduct | undefined = route.params?.product
  const productId: string | undefined = productParam?.id ?? route.params?.productId
  const cart = useCart()

  const [product, setProduct] = React.useState<CatalogProduct | null>(productParam ?? null)
  const [loading, setLoading] = React.useState(false)
  const [pickerVisible, setPickerVisible] = React.useState(false)
  const [selectedSkuId, setSelectedSkuId] = React.useState<string | null>(null)
  const [quantity, setQuantity] = React.useState(1)

  const loadData = React.useCallback(async () => {
    if (!productId) return
    setLoading(true)
    try {
      const data = await CatalogProductService.getProduct(productId)
      setProduct(data)
    } finally {
      setLoading(false)
    }
  }, [productId])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const getCurrentPrice = React.useCallback((sku: CatalogProduct['skus'][number]) => {
    const current = sku.precios?.find((price) => !price.vigente_hasta) ?? sku.precios?.[0]
    if (!current) return 'Precio a confirmar'
    const parsed = Number(current.precio)
    if (!Number.isFinite(parsed)) return 'Precio a confirmar'
    return `${current.moneda} ${parsed.toFixed(2)}`
  }, [])

  const handleConfirm = () => {
    if (!product) return
    const sku = product.skus?.find((item) => item.id === selectedSkuId)
    if (!sku) {
      showGlobalToast('Selecciona una presentacion', 'warning')
      return
    }
    const current = sku.precios?.find((price) => !price.vigente_hasta) ?? sku.precios?.[0]
    const parsedPrice = current ? Number(current.precio) : NaN
    if (!current || !Number.isFinite(parsedPrice)) {
      showGlobalToast('Este SKU no tiene precio vigente', 'warning')
      return
    }
    cart.addItem({
      id: sku.id,
      skuId: sku.id,
      skuName: sku.nombre,
      skuCode: sku.codigo_sku,
      productId: product.id,
      productName: product.nombre,
      price: parsedPrice,
      quantity,
      image: product.img_url ?? undefined,
      categoryName: product.categoria?.nombre ?? 'Catalogo',
    })
    setPickerVisible(false)
    showGlobalToast(`Se agrego ${sku.nombre} al carrito`, 'success')
  }

  if (!product && !loading) {
    return (
      <View className="flex-1 bg-neutral-50">
        <Header title="Detalle del producto" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SellerHeaderMenu />} />
        <EmptyState
          icon="search-outline"
          title="Producto no encontrado"
          description="No pudimos cargar la informacion del producto."
        />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Detalle del producto" variant="standard" onBackPress={() => navigation.goBack()} rightElement={<SellerHeaderMenu />} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={BRAND_COLORS.red} />}
        contentContainerStyle={{ paddingBottom: 140, flexGrow: 1 }}
      >
        <View className="px-5 py-4">
          <View className="bg-white rounded-3xl border border-neutral-200 overflow-hidden" style={styles.card}>
            <View className="h-52 bg-neutral-100">
              {product?.img_url ? (
                <Image source={{ uri: product.img_url }} style={styles.image} resizeMode="cover" />
              ) : (
                <View className="flex-1 items-center justify-center bg-neutral-100">
                  <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                  <Text className="text-xs text-neutral-400 mt-2">Sin imagen</Text>
                </View>
              )}
            </View>
            <View className="px-5 py-5">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xl font-bold text-neutral-900 flex-1" numberOfLines={2}>
                  {product?.nombre ?? ''}
                </Text>
                <View className="px-3 py-1 rounded-full bg-red-50 border border-red-100 ml-3">
                  <Text className="text-[11px] font-semibold text-red-600">{product?.slug ?? ''}</Text>
                </View>
              </View>
              <Text className="text-sm text-neutral-500">
                {product?.categoria?.nombre ?? 'Catalogo general'}
              </Text>
              {product?.descripcion ? (
                <Text className="text-sm text-neutral-700 mt-3 leading-5">{product.descripcion}</Text>
              ) : (
                <Text className="text-sm text-neutral-400 mt-3">Sin descripcion registrada.</Text>
              )}
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-base font-bold text-neutral-900 mb-3">Presentaciones disponibles</Text>
            {product?.skus?.length ? (
              product.skus.map((sku) => (
                <View
                  key={sku.id}
                  className="bg-white rounded-2xl border border-neutral-200 px-4 py-4 mb-3"
                  style={styles.card}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-3">
                      <Text className="text-base font-bold text-neutral-900">{sku.nombre}</Text>
                      <Text className="text-xs text-neutral-500 mt-1">{sku.codigo_sku}</Text>
                      <View className="flex-row flex-wrap items-center gap-2 mt-3">
                        <View className="px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200">
                          <Text className="text-xs text-neutral-700">{sku.peso_gramos} g</Text>
                        </View>
                        <View className="px-3 py-1 rounded-full bg-red-50 border border-red-100">
                          <Text className="text-xs font-semibold text-red-600">{getCurrentPrice(sku)}</Text>
                        </View>
                      </View>
                    </View>
                    <View className="w-10 h-10 rounded-xl items-center justify-center border border-red-100 bg-red-50">
                      <Ionicons name="barcode-outline" size={20} color={BRAND_COLORS.red} />
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className="bg-white rounded-2xl border border-dashed border-neutral-300 px-4 py-4">
                <Text className="text-sm text-neutral-600">Aun no hay presentaciones registradas.</Text>
              </View>
            )}
          </View>

          <View className="mt-6">
            <PrimaryButton title="Agregar al carrito" onPress={() => setPickerVisible(true)} />
          </View>
        </View>
      </ScrollView>

      <SkuPickerModal
        visible={pickerVisible}
        title={product ? `Agregar ${product.nombre}` : 'Selecciona SKU'}
        skus={product?.skus ?? []}
        selectedSkuId={selectedSkuId}
        quantity={quantity}
        onSelectSku={setSelectedSkuId}
        onQuantityChange={setQuantity}
        onClose={() => setPickerVisible(false)}
        onConfirm={handleConfirm}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
})
