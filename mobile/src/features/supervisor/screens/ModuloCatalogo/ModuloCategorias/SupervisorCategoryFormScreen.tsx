import React from 'react'
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../../components/ui/SupervisorHeaderMenu'
import { TextField } from '../../../../../components/ui/TextField'
import { PrimaryButton } from '../../../../../components/ui/PrimaryButton'
import { CatalogCategory, CatalogCategoryService } from '../../../../../services/api/CatalogCategoryService'
import { slugify } from '../../../../../utils/slug'
import { showGlobalToast } from '../../../../../utils/toastService'
import { getUserFriendlyMessage } from '../../../../../utils/errorMessages'

export function SupervisorCategoryFormScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const categoryParam: CatalogCategory | null = route.params?.category ?? null
  const categoryId: string | undefined = route.params?.categoryId

  const [category, setCategory] = React.useState<CatalogCategory | null>(categoryParam)
  const [nombre, setNombre] = React.useState(categoryParam?.nombre || '')
  const [slug, setSlug] = React.useState(categoryParam?.slug || '')
  const [descripcion, setDescripcion] = React.useState(categoryParam?.descripcion || '')
  const [saving, setSaving] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const isEditing = !!categoryParam || !!categoryId

  const loadCategory = React.useCallback(async () => {
    if (!categoryId) return
    setLoading(true)
    try {
      const data = await CatalogCategoryService.getCategory(categoryId)
      if (data) {
        setCategory(data)
        setNombre(data.nombre)
        setSlug(data.slug)
        setDescripcion(data.descripcion ?? '')
      }
    } finally {
      setLoading(false)
    }
  }, [categoryId])

  React.useEffect(() => {
    loadCategory()
  }, [loadCategory])

  const validate = () => {
    if (!nombre.trim()) {
      showGlobalToast('Nombre requerido.', 'error')
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
        nombre: nombre.trim(),
        slug: slugValue,
        descripcion: descripcion.trim() || undefined,
      }
      const result = isEditing && category?.id
        ? await CatalogCategoryService.updateCategory(category.id, payload)
        : await CatalogCategoryService.createCategory(payload)

      if (!result) throw new Error('SAVE_ERROR')
      showGlobalToast(isEditing ? 'Categoria actualizada.' : 'Categoria creada.', 'success')
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
        title={isEditing ? 'Editar categoria' : 'Nueva categoria'}
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
                  {isEditing ? 'Informacion de la categoria' : 'Crear categoria'}
                </Text>
                <Text className="text-sm text-neutral-500">
                  Define el nombre y la descripcion de la categoria.
                </Text>
              </View>

              <TextField
                label="Nombre"
                placeholder="Ej. Bebidas"
                value={nombre}
                onChangeText={setNombre}
              />
              <TextField
                label="Slug"
                placeholder="bebidas"
                value={slug}
                onChangeText={setSlug}
              />
              <TextField
                label="Descripcion"
                placeholder="Describe la categoria"
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
              />

              <PrimaryButton title={isEditing ? 'Guardar cambios' : 'Crear categoria'} onPress={handleSave} loading={saving || loading} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}
