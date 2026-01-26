import React from 'react'
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../../components/ui/SupervisorHeaderMenu'
import { TextField } from '../../../../../components/ui/TextField'
import { PrimaryButton } from '../../../../../components/ui/PrimaryButton'
import { ComboBox, ComboBoxOption } from '../../../../../components/ui/ComboBox'
import { CatalogProduct, CatalogProductService } from '../../../../../services/api/CatalogProductService'
import { CatalogCategory, CatalogCategoryService } from '../../../../../services/api/CatalogCategoryService'
import { slugify } from '../../../../../utils/slug'
import { showGlobalToast } from '../../../../../utils/toastService'
import { getUserFriendlyMessage } from '../../../../../utils/errorMessages'

export function SupervisorProductFormScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const productParam: CatalogProduct | null = route.params?.product ?? null
  const productId: string | undefined = route.params?.productId

  const [product, setProduct] = React.useState<CatalogProduct | null>(productParam)
  const [categories, setCategories] = React.useState<CatalogCategory[]>([])
  const [categoriaId, setCategoriaId] = React.useState<string>(productParam?.categoria?.id || productParam?.categoria_id || '')
  const [nombre, setNombre] = React.useState(productParam?.nombre || '')
  const [slug, setSlug] = React.useState(productParam?.slug || '')
  const [descripcion, setDescripcion] = React.useState(productParam?.descripcion || '')
  const [saving, setSaving] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const isEditing = !!productParam || !!productId

  const loadCategories = React.useCallback(async () => {
    const data = await CatalogCategoryService.getCategories()
    setCategories(data)
  }, [])

  const loadProduct = React.useCallback(async () => {
    if (!productId) return
    setLoading(true)
    try {
      const data = await CatalogProductService.getProduct(productId)
      if (data) {
        setProduct(data)
        setNombre(data.nombre)
        setSlug(data.slug)
        setDescripcion(data.descripcion ?? '')
        setCategoriaId(data.categoria?.id || data.categoria_id || '')
      }
    } finally {
      setLoading(false)
    }
  }, [productId])

  React.useEffect(() => {
    loadCategories()
    loadProduct()
  }, [loadCategories, loadProduct])

  const categoryOptions: ComboBoxOption<string>[] = categories.map((category) => ({
    value: category.id,
    label: category.nombre,
    description: category.descripcion || undefined,
  }))

  const validate = () => {
    if (!nombre.trim()) {
      showGlobalToast('Nombre requerido.', 'error')
      return false
    }
    if (!categoriaId) {
      showGlobalToast('Selecciona una categoria.', 'error')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const slugValue = slug.trim() || slugify(nombre)
      const payload = {
        categoria_id: categoriaId,
        nombre: nombre.trim(),
        slug: slugValue,
        descripcion: descripcion.trim() || undefined,
      }

      const result = isEditing && product?.id
        ? await CatalogProductService.updateProduct(product.id, payload)
        : await CatalogProductService.createProduct(payload)

      if (!result) throw new Error('SAVE_ERROR')
      showGlobalToast(isEditing ? 'Producto actualizado.' : 'Producto creado.', 'success')
      navigation.goBack()
    } catch (error) {
      showGlobalToast(getUserFriendlyMessage(error, 'CREATE_ERROR'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title={isEditing ? 'Editar producto' : 'Nuevo producto'}
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu />}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="px-5 py-4 gap-5">
            <View className="bg-white rounded-3xl border border-neutral-200 p-5 gap-4">
              <View>
                <Text className="text-lg font-bold text-neutral-900">
                  {isEditing ? 'Informacion del producto' : 'Crear producto'}
                </Text>
                <Text className="text-sm text-neutral-500">
                  Completa los datos principales del producto.
                </Text>
              </View>

              <ComboBox
                label="Categoria"
                options={categoryOptions}
                value={categoriaId}
                onValueChange={(value) => setCategoriaId(String(value))}
                placeholder="Seleccionar categoria"
                description="Elige la categoria base del producto."
              />

              <TextField
                label="Nombre"
                placeholder="Ej. Cola Zero"
                value={nombre}
                onChangeText={setNombre}
              />
              <TextField
                label="Slug"
                placeholder="cola-zero"
                value={slug}
                onChangeText={setSlug}
              />
              <TextField
                label="Descripcion"
                placeholder="Describe el producto"
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
              />

              <PrimaryButton title={isEditing ? 'Guardar cambios' : 'Crear producto'} onPress={handleSave} loading={saving || loading} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}
