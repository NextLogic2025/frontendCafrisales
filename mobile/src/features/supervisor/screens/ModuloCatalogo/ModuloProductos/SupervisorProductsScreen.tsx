import React from 'react'
import { View, Text, Pressable, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../../components/ui/SupervisorHeaderMenu'
import { SearchBar } from '../../../../../components/ui/SearchBar'
import { GenericList } from '../../../../../components/ui/GenericList'
import { CategoryFilter } from '../../../../../components/ui/CategoryFilter'
import { FeedbackModal, FeedbackType } from '../../../../../components/ui/FeedbackModal'
import { ExpandableFab } from '../../../../../components/ui/ExpandableFab'
import { BRAND_COLORS } from '../../../../../shared/types'
import { CatalogProduct, CatalogProductService } from '../../../../../services/api/CatalogProductService'
import { showGlobalToast } from '../../../../../utils/toastService'

type ProductFilter = 'todos' | 'con-sku' | 'sin-sku'

export function SupervisorProductsScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const [products, setProducts] = React.useState<CatalogProduct[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filter, setFilter] = React.useState<ProductFilter>('todos')
  const [loading, setLoading] = React.useState(false)

  const [feedbackVisible, setFeedbackVisible] = React.useState(false)
  const [feedbackConfig, setFeedbackConfig] = React.useState<{
    type: FeedbackType
    title: string
    message: string
    onConfirm?: () => void
    showCancel?: boolean
    confirmText?: string
  }>({ type: 'info', title: '', message: '' })

  const fetchProducts = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await CatalogProductService.getProducts()
      setProducts(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts()
    }, [fetchProducts]),
  )

  const upsertProduct = React.useCallback((incoming: CatalogProduct) => {
    setProducts((prev) => {
      const exists = prev.find((item) => item.id === incoming.id)
      if (!exists) {
        return [incoming, ...prev]
      }
      return prev.map((item) => (item.id === incoming.id ? { ...item, ...incoming } : item))
    })
  }, [])

  React.useEffect(() => {
    const incoming = route.params?.upsertProduct as CatalogProduct | undefined
    if (incoming) {
      upsertProduct(incoming)
      setFilter('todos')
      setSearchQuery('')
      navigation.setParams({ upsertProduct: undefined })
    }
    if (route.params?.refresh) {
      fetchProducts()
      navigation.setParams({ refresh: undefined })
    }
  }, [fetchProducts, navigation, route.params?.refresh, route.params?.upsertProduct, upsertProduct])

  const filteredProducts = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return products.filter((product) => {
      const hasSku = (product.skus?.length ?? 0) > 0
      if (filter === 'con-sku' && !hasSku) return false
      if (filter === 'sin-sku' && hasSku) return false

      if (!query) return true
      const categoryName = product.categoria?.nombre ?? ''
      return (
        product.nombre.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query)
      )
    })
  }, [products, searchQuery, filter])

  const confirmDelete = (product: CatalogProduct) => {
    setFeedbackConfig({
      type: 'warning',
      title: 'Eliminar producto?',
      message: `Estas seguro de eliminar ${product.nombre}?`,
      showCancel: true,
      confirmText: 'Si, eliminar',
      onConfirm: () => handleDelete(product),
    })
    setFeedbackVisible(true)
  }

  const handleDelete = async (product: CatalogProduct) => {
    setFeedbackVisible(false)
    setLoading(true)
    try {
      const ok = await CatalogProductService.deleteProduct(product.id)
      if (!ok) throw new Error('DELETE_ERROR')
      showGlobalToast('Producto eliminado.', 'success')
      await fetchProducts()
    } catch {
      showGlobalToast('No se pudo eliminar el producto.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filterOptions = [
    { id: 'todos', name: 'Todos' },
    { id: 'con-sku', name: 'Con SKU' },
    { id: 'sin-sku', name: 'Sin SKU' },
  ]

  const menuActions = [
    {
      label: 'Nuevo producto',
      icon: 'add-circle-outline' as const,
      onPress: () => navigation.navigate('SupervisorProductForm', { product: null }),
    },
    {
      label: 'Actualizar',
      icon: 'refresh' as const,
      onPress: fetchProducts,
    },
  ]

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Catalogo"
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu extraActions={menuActions} />}
      />

      <View className="px-5 py-4 bg-white shadow-sm z-10">
        <View className="flex-row items-center">
          <View className="flex-1 mr-3">
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar producto..."
              onClear={() => setSearchQuery('')}
            />
          </View>
          <TouchableOpacity
            className="w-14 h-14 rounded-2xl items-center justify-center shadow-sm"
            style={{ backgroundColor: BRAND_COLORS.red }}
            onPress={() => navigation.navigate('SupervisorProductForm', { product: null })}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <View className="mt-3">
          <CategoryFilter
            categories={filterOptions}
            selectedId={filter}
            onSelect={(value) => setFilter(value as ProductFilter)}
          />
        </View>
      </View>

      <View className="flex-1">
        <GenericList
          items={filteredProducts}
          onRefresh={fetchProducts}
          isLoading={loading}
          emptyState={{
            icon: 'cube-outline',
            title: 'Sin productos',
            message: 'Crea productos para armar tu catalogo.',
          }}
          renderItem={(product) => (
            <Pressable
              onPress={() => navigation.navigate('SupervisorProductDetail', { product })}
              onLongPress={() => confirmDelete(product)}
              className="bg-white rounded-2xl border border-neutral-200 px-4 py-4 mb-4"
              style={styles.card}
            >
              <View style={styles.cardRow}>
                {product.img_url ? (
                  <Image source={{ uri: product.img_url }} style={styles.imageThumb} resizeMode="cover" />
                ) : (
                  <View style={styles.iconWrap}>
                    <Ionicons name="image-outline" size={20} color="#9CA3AF" />
                  </View>
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.title} numberOfLines={1}>
                    {product.nombre}
                  </Text>
                  <Text style={styles.subtitle}>
                    Categoria: {product.categoria?.nombre ?? 'Sin categoria'}
                  </Text>
                  <Text style={styles.meta}>
                    SKU: {product.skus?.length ?? 0} | Slug: {product.slug}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
            </Pressable>
          )}
        />
      </View>

      <ExpandableFab
        actions={[
          {
            label: 'Categorias',
            icon: 'pricetag-outline',
            onPress: () => navigation.navigate('SupervisorCategories'),
          },
          {
            label: 'SKU',
            icon: 'barcode-outline',
            onPress: () => navigation.navigate('SupervisorSkus'),
          },
          {
            label: 'Precios',
            icon: 'cash-outline',
            onPress: () => navigation.navigate('SupervisorPrices'),
          },
        ]}
      />

      <FeedbackModal
        visible={feedbackVisible}
        type={feedbackConfig.type}
        title={feedbackConfig.title}
        message={feedbackConfig.message}
        onClose={() => setFeedbackVisible(false)}
        onConfirm={feedbackConfig.onConfirm}
        showCancel={feedbackConfig.showCancel}
        confirmText={feedbackConfig.confirmText}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#F5F5F5',
  },
  imageThumb: {
    width: 46,
    height: 46,
    borderRadius: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  meta: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
})
