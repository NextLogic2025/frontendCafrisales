import React from 'react'
import { View, Text, Image, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../../components/ui/SupervisorHeaderMenu'
import { TextField } from '../../../../../components/ui/TextField'
import { PrimaryButton } from '../../../../../components/ui/PrimaryButton'
import { KeyboardFormLayout } from '../../../../../components/ui/KeyboardFormLayout'
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
  const [imgUrl, setImgUrl] = React.useState(categoryParam?.img_url || '')
  const [localImageUri, setLocalImageUri] = React.useState<string | null>(null)
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
        setImgUrl(data.img_url ?? '')
        setLocalImageUri(null)
      }
    } finally {
      setLoading(false)
    }
  }, [categoryId])

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissionResult.granted) {
      showGlobalToast('Se necesitan permisos para acceder a la galeria', 'warning')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled && result.assets?.[0]?.uri) {
      setLocalImageUri(result.assets[0].uri)
      setImgUrl('')
    }
  }

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
    if (!permissionResult.granted) {
      showGlobalToast('Se necesitan permisos para usar la camara', 'warning')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled && result.assets?.[0]?.uri) {
      setLocalImageUri(result.assets[0].uri)
      setImgUrl('')
    }
  }

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
      if (localImageUri) {
        const fileName = localImageUri.split('/').pop() || `categoria-${result.id}.jpg`
        const fileExt = fileName.split('.').pop()?.toLowerCase()
        const mimeType =
          fileExt === 'png'
            ? 'image/png'
            : fileExt === 'webp'
              ? 'image/webp'
              : fileExt === 'heic'
                ? 'image/heic'
                : 'image/jpeg'
        const uploaded = await CatalogCategoryService.uploadCategoryImage(result.id, {
          uri: localImageUri,
          name: fileName,
          type: mimeType,
        })
        if (!uploaded) {
          showGlobalToast('La categoria se guardo, pero la imagen no se pudo subir.', 'warning')
        }
      }
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

      <KeyboardFormLayout>
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
            <View>
              <Text className="text-xs font-semibold text-neutral-500 mb-2">Imagen</Text>
              {localImageUri ? (
                <View className="rounded-2xl overflow-hidden border border-neutral-200">
                  <Image source={{ uri: localImageUri }} style={{ width: '100%', height: 160 }} resizeMode="cover" />
                  <Pressable
                    onPress={() => setLocalImageUri(null)}
                    className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </Pressable>
                </View>
              ) : imgUrl.trim() ? (
                <View className="gap-3">
                  <View className="rounded-2xl overflow-hidden border border-neutral-200">
                    <Image
                      source={{ uri: imgUrl.trim() }}
                      style={{ width: '100%', height: 160 }}
                      resizeMode="cover"
                    />
                  </View>
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={takePhoto}
                      className="flex-1 border border-dashed border-neutral-300 rounded-2xl py-4 items-center justify-center bg-neutral-50"
                    >
                      <Ionicons name="camera-outline" size={24} color="#EF4444" />
                      <Text className="text-xs text-neutral-600 mt-2 font-semibold">Tomar foto</Text>
                    </Pressable>
                    <Pressable
                      onPress={pickImage}
                      className="flex-1 border border-dashed border-neutral-300 rounded-2xl py-4 items-center justify-center bg-neutral-50"
                    >
                      <Ionicons name="images-outline" size={24} color="#EF4444" />
                      <Text className="text-xs text-neutral-600 mt-2 font-semibold">Galeria</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={takePhoto}
                    className="flex-1 border border-dashed border-neutral-300 rounded-2xl py-6 items-center justify-center bg-neutral-50"
                  >
                    <Ionicons name="camera-outline" size={28} color="#EF4444" />
                    <Text className="text-xs text-neutral-600 mt-2 font-semibold">Tomar foto</Text>
                  </Pressable>
                  <Pressable
                    onPress={pickImage}
                    className="flex-1 border border-dashed border-neutral-300 rounded-2xl py-6 items-center justify-center bg-neutral-50"
                  >
                    <Ionicons name="images-outline" size={28} color="#EF4444" />
                    <Text className="text-xs text-neutral-600 mt-2 font-semibold">Galeria</Text>
                  </Pressable>
                </View>
              )}
            </View>

            <PrimaryButton title={isEditing ? 'Guardar cambios' : 'Crear categoria'} onPress={handleSave} loading={saving || loading} />
          </View>
        </View>
      </KeyboardFormLayout>
    </View>
  )
}
