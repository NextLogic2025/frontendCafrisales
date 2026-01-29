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
import { CatalogCategory, CatalogCategoryService } from '../../../../../services/api/CatalogCategoryService'
import { showGlobalToast } from '../../../../../utils/toastService'

type CategoryFilterOption = 'todas' | 'con-descripcion'

export function SupervisorCategoriesScreen() {
  const navigation = useNavigation<any>()
  const [categories, setCategories] = React.useState<CatalogCategory[]>([])
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filter, setFilter] = React.useState<CategoryFilterOption>('todas')
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

  const fetchCategories = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await CatalogCategoryService.getCategories()
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchCategories()
    }, [fetchCategories]),
  )

  const filteredCategories = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return categories.filter((category) => {
      if (filter === 'con-descripcion' && !category.descripcion) return false
      if (!query) return true
      return (
        category.nombre.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        (category.descripcion ?? '').toLowerCase().includes(query)
      )
    })
  }, [categories, searchQuery, filter])

  const confirmDelete = (category: CatalogCategory) => {
    setFeedbackConfig({
      type: 'warning',
      title: 'Eliminar categoria?',
      message: `Estas seguro de eliminar ${category.nombre}?`,
      showCancel: true,
      confirmText: 'Si, eliminar',
      onConfirm: () => handleDelete(category),
    })
    setFeedbackVisible(true)
  }

  const handleDelete = async (category: CatalogCategory) => {
    setFeedbackVisible(false)
    setLoading(true)
    try {
      const ok = await CatalogCategoryService.deleteCategory(category.id)
      if (!ok) throw new Error('DELETE_ERROR')
      showGlobalToast('Categoria eliminada.', 'success')
      await fetchCategories()
    } catch {
      showGlobalToast('No se pudo eliminar la categoria.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filterOptions = [
    { id: 'todas', name: 'Todas' },
    { id: 'con-descripcion', name: 'Con descripcion' },
  ]

  const menuActions = [
    {
      label: 'Nueva categoria',
      icon: 'add-circle-outline' as const,
      onPress: () => navigation.navigate('SupervisorCategoryForm', { category: null }),
    },
    {
      label: 'Actualizar',
      icon: 'refresh' as const,
      onPress: fetchCategories,
    },
  ]

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Categorias"
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
              placeholder="Buscar categoria..."
              onClear={() => setSearchQuery('')}
            />
          </View>
          <TouchableOpacity
            className="w-14 h-14 rounded-2xl items-center justify-center shadow-sm"
            style={{ backgroundColor: BRAND_COLORS.red }}
            onPress={() => navigation.navigate('SupervisorCategoryForm', { category: null })}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <View className="mt-3">
          <CategoryFilter
            categories={filterOptions}
            selectedId={filter}
            onSelect={(value) => setFilter(value as CategoryFilterOption)}
          />
        </View>
      </View>

      <View className="flex-1">
        <GenericList
          items={filteredCategories}
          onRefresh={fetchCategories}
          isLoading={loading}
          emptyState={{
            icon: 'pricetag-outline',
            title: 'Sin categorias',
            message: 'Organiza los productos por categorias.',
          }}
          renderItem={(category) => (
            <Pressable
              onPress={() => navigation.navigate('SupervisorCategoryDetail', { category })}
              onLongPress={() => confirmDelete(category)}
              className="bg-white rounded-2xl border border-neutral-200 px-4 py-4 mb-4"
              style={styles.card}
            >
              <View style={styles.cardRow}>
                <View style={styles.iconWrap}>
                  <Ionicons name="pricetag-outline" size={20} color={BRAND_COLORS.red} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.title} numberOfLines={1}>
                    {category.nombre}
                  </Text>
                  <Text style={styles.subtitle}>Slug: {category.slug}</Text>
                  {category.descripcion ? (
                    <Text style={styles.meta} numberOfLines={2}>
                      {category.descripcion}
                    </Text>
                  ) : null}
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
    color: '#6B7280',
    marginTop: 6,
  },
})
