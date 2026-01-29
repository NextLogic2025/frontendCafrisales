import React from 'react'
import { View, Text, Pressable, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Header } from '../../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../../components/ui/SupervisorHeaderMenu'
import { SearchBar } from '../../../../../components/ui/SearchBar'
import { GenericList } from '../../../../../components/ui/GenericList'
import { CategoryFilter } from '../../../../../components/ui/CategoryFilter'
import { FeedbackModal, FeedbackType } from '../../../../../components/ui/FeedbackModal'
import { BRAND_COLORS } from '../../../../../services/shared/types'
import { CatalogSku, CatalogSkuService } from '../../../../../services/api/CatalogSkuService'
import { showGlobalToast } from '../../../../../utils/toastService'

type SkuFilter = 'todos' | 'ligero' | 'pesado'

export function SupervisorSkusScreen() {
  const navigation = useNavigation<any>()
  const [skus, setSkus] = React.useState<CatalogSku[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filter, setFilter] = React.useState<SkuFilter>('todos')
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

  const fetchSkus = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await CatalogSkuService.getSkus()
      setSkus(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchSkus()
    }, [fetchSkus]),
  )

  const filteredSkus = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return skus.filter((sku) => {
      const peso = sku.peso_gramos || 0
      if (filter === 'ligero' && peso > 1000) return false
      if (filter === 'pesado' && peso <= 1000) return false

      if (!query) return true
      const productName = sku.producto?.nombre ?? ''
      return (
        sku.codigo_sku.toLowerCase().includes(query) ||
        sku.nombre.toLowerCase().includes(query) ||
        productName.toLowerCase().includes(query)
      )
    })
  }, [skus, searchQuery, filter])

  const confirmDelete = (sku: CatalogSku) => {
    setFeedbackConfig({
      type: 'warning',
      title: 'Eliminar SKU?',
      message: `Estas seguro de eliminar ${sku.codigo_sku}?`,
      showCancel: true,
      confirmText: 'Si, eliminar',
      onConfirm: () => handleDelete(sku),
    })
    setFeedbackVisible(true)
  }

  const handleDelete = async (sku: CatalogSku) => {
    setFeedbackVisible(false)
    setLoading(true)
    try {
      const ok = await CatalogSkuService.deleteSku(sku.id)
      if (!ok) throw new Error('DELETE_ERROR')
      showGlobalToast('SKU eliminado.', 'success')
      await fetchSkus()
    } catch {
      showGlobalToast('No se pudo eliminar el SKU.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filterOptions = [
    { id: 'todos', name: 'Todos' },
    { id: 'ligero', name: 'Ligero' },
    { id: 'pesado', name: 'Pesado' },
  ]

  const menuActions = [
    {
      label: 'Nuevo SKU',
      icon: 'add-circle-outline' as const,
      onPress: () => navigation.navigate('SupervisorSkuForm', { sku: null }),
    },
    {
      label: 'Actualizar',
      icon: 'refresh' as const,
      onPress: fetchSkus,
    },
  ]

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="SKU"
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
              placeholder="Buscar SKU..."
              onClear={() => setSearchQuery('')}
            />
          </View>
          <TouchableOpacity
            className="w-14 h-14 rounded-2xl items-center justify-center shadow-sm"
            style={{ backgroundColor: BRAND_COLORS.red }}
            onPress={() => navigation.navigate('SupervisorSkuForm', { sku: null })}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <View className="mt-3">
          <CategoryFilter
            categories={filterOptions}
            selectedId={filter}
            onSelect={(value) => setFilter(value as SkuFilter)}
          />
        </View>
      </View>

      <View className="flex-1">
        <GenericList
          items={filteredSkus}
          onRefresh={fetchSkus}
          isLoading={loading}
          emptyState={{
            icon: 'barcode-outline',
            title: 'Sin SKU',
            message: 'Crea SKUs para las presentaciones de productos.',
          }}
          renderItem={(sku) => (
            <Pressable
              onPress={() => navigation.navigate('SupervisorSkuDetail', { sku })}
              onLongPress={() => confirmDelete(sku)}
              className="bg-white rounded-2xl border border-neutral-200 px-4 py-4 mb-4"
              style={styles.card}
            >
              <View style={styles.cardRow}>
                <View style={styles.iconWrap}>
                  <Ionicons name="barcode-outline" size={20} color={BRAND_COLORS.red} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.title} numberOfLines={1}>
                    {sku.codigo_sku}
                  </Text>
                  <Text style={styles.subtitle}>
                    {sku.nombre} - {sku.peso_gramos}g
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    Producto: {sku.producto?.nombre ?? 'Sin producto'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
            </Pressable>
          )}
        />
      </View>

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
    backgroundColor: '#FEF2F2',
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
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
})
