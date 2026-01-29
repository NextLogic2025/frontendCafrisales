import React from 'react'
import { FlatList, RefreshControl, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Header } from '../ui/Header'
import { SearchBar } from '../ui/SearchBar'
import { CategoryFilter } from '../ui/CategoryFilter'
import { EmptyState } from '../ui/EmptyState'
import { LoadingScreen } from '../ui/LoadingScreen'
import { CatalogProductGridCard } from '../ui/CatalogProductGridCard'
import { BRAND_COLORS } from '../../services/shared/types'
import { CatalogCategory, CatalogCategoryService } from '../../services/api/CatalogCategoryService'
import { CatalogProduct, CatalogProductService } from '../../services/api/CatalogProductService'

type CategoryOption = {
  id: string
  name: string
}

type Props = {
  title?: string
  onProductPress?: (product: CatalogProduct) => void
  onQuickAdd?: (product: CatalogProduct) => void
  headerRightElement?: React.ReactNode
}

const ALL_CATEGORY_ID = 'todos'

export function ProductCatalogTemplate({ title = 'Productos', onProductPress, onQuickAdd, headerRightElement }: Props) {
  const [products, setProducts] = React.useState<CatalogProduct[]>([])
  const [categories, setCategories] = React.useState<CatalogCategory[]>([])
  const [loading, setLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string>(ALL_CATEGORY_ID)

  const categoryMap = React.useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.nombre]))
  }, [categories])

  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [productData, categoryData] = await Promise.all([
        CatalogProductService.getProducts(),
        CatalogCategoryService.getCategories(),
      ])
      setProducts(productData)
      setCategories(categoryData)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadData()
    }, [loadData]),
  )

  const categoryOptions = React.useMemo<CategoryOption[]>(() => {
    return [{ id: ALL_CATEGORY_ID, name: 'Todos' }].concat(
      categories.map((category) => ({
        id: category.id,
        name: category.nombre,
      })),
    )
  }, [categories])

  const filteredProducts = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return products.filter((product) => {
      if (selectedCategoryId !== ALL_CATEGORY_ID) {
        const productCategoryId = product.categoria?.id ?? product.categoria_id
        if (productCategoryId !== selectedCategoryId) return false
      }

      if (!query) return true
      const categoryName =
        product.categoria?.nombre ??
        (product.categoria_id ? categoryMap.get(product.categoria_id) : '') ??
        ''
      return (
        product.nombre.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query)
      )
    })
  }, [products, searchQuery, selectedCategoryId, categoryMap])

  const getCategoryName = React.useCallback(
    (product: CatalogProduct) => {
      return (
        product.categoria?.nombre ??
        (product.categoria_id ? categoryMap.get(product.categoria_id) : undefined) ??
        'Catalogo general'
      )
    },
    [categoryMap],
  )

  const getPriceLabel = React.useCallback((product: CatalogProduct) => {
    const prices: { precio: number; moneda: string }[] = []
    product.skus?.forEach((sku) => {
      const current = sku.precios?.find((price) => !price.vigente_hasta) ?? sku.precios?.[0]
      const parsed = current ? Number(current.precio) : NaN
      if (current && Number.isFinite(parsed)) {
        prices.push({ precio: parsed, moneda: current.moneda })
      }
    })

    if (!prices.length) {
      return 'Precio a confirmar'
    }

    const lowest = prices.reduce((acc, item) => (item.precio < acc.precio ? item : acc), prices[0])
    return `${lowest.moneda} ${lowest.precio.toFixed(2)}`
  }, [])

  if (loading && products.length === 0) {
    return <LoadingScreen />
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title={title} variant="standard" rightElement={headerRightElement} />

      <View className="bg-white px-5 py-4 border-b border-neutral-100">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Busca productos"
          onClear={() => setSearchQuery('')}
        />
        <View className="mt-3">
          <CategoryFilter
            categories={categoryOptions}
            selectedId={selectedCategoryId}
            onSelect={(id) => setSelectedCategoryId(id as string)}
          />
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={BRAND_COLORS.red} />}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
        columnWrapperStyle={{ paddingHorizontal: 20, gap: 14 }}
        renderItem={({ item }) => (
          <View className="flex-1 mb-5">
            <CatalogProductGridCard
              product={item}
              categoryName={getCategoryName(item)}
              priceLabel={getPriceLabel(item)}
              onPress={onProductPress ? () => onProductPress(item) : () => { }}
              onQuickAdd={onQuickAdd ? () => onQuickAdd(item) : undefined}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="No hay productos"
            description="No encontramos productos disponibles con esos filtros."
          />
        }
      />
    </View>
  )
}
