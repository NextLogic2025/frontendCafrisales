import React from 'react'
import { View, Text } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../../components/ui/SupervisorHeaderMenu'
import { TextField } from '../../../../../components/ui/TextField'
import { PrimaryButton } from '../../../../../components/ui/PrimaryButton'
import { ComboBox, ComboBoxOption } from '../../../../../components/ui/ComboBox'
import { KeyboardFormLayout } from '../../../../../components/ui/KeyboardFormLayout'
import { CatalogSku, CatalogSkuService } from '../../../../../services/api/CatalogSkuService'
import { CatalogProduct, CatalogProductService } from '../../../../../services/api/CatalogProductService'
import { showGlobalToast } from '../../../../../utils/toastService'
import { getUserFriendlyMessage } from '../../../../../utils/errorMessages'

export function SupervisorSkuFormScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const skuParam: CatalogSku | null = route.params?.sku ?? null
  const skuId: string | undefined = route.params?.skuId

  const skuPrefix = 'SKU-'
  const getSkuSuffix = (code: string) => {
    if (!code) return ''
    return code.startsWith(skuPrefix) ? code.slice(skuPrefix.length) : code
  }

  const [sku, setSku] = React.useState<CatalogSku | null>(skuParam)
  const [products, setProducts] = React.useState<CatalogProduct[]>([])
  const [productoId, setProductoId] = React.useState<string>(skuParam?.producto?.id || skuParam?.producto_id || '')
  const [codigoSku, setCodigoSku] = React.useState(getSkuSuffix(skuParam?.codigo_sku || ''))
  const [nombre, setNombre] = React.useState(skuParam?.nombre || '')
  const [peso, setPeso] = React.useState(skuParam?.peso_gramos ? String(skuParam.peso_gramos) : '')
  const [saving, setSaving] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const isEditing = !!skuParam || !!skuId

  const loadProducts = React.useCallback(async () => {
    const data = await CatalogProductService.getProducts()
    setProducts(data)
  }, [])

  const loadSku = React.useCallback(async () => {
    if (!skuId) return
    setLoading(true)
    try {
      const data = await CatalogSkuService.getSku(skuId)
      if (data) {
        setSku(data)
        setCodigoSku(getSkuSuffix(data.codigo_sku))
        setNombre(data.nombre)
        setPeso(String(data.peso_gramos ?? ''))
        setProductoId(data.producto?.id || data.producto_id || '')
      }
    } finally {
      setLoading(false)
    }
  }, [skuId])

  React.useEffect(() => {
    loadProducts()
    loadSku()
  }, [loadProducts, loadSku])

  const productOptions: ComboBoxOption<string>[] = products.map((product) => ({
    value: product.id,
    label: product.nombre,
    description: product.categoria?.nombre,
  }))

  const validate = () => {
    if (!productoId) {
      showGlobalToast('Selecciona un producto.', 'error')
      return false
    }
    if (!codigoSku.trim()) {
      showGlobalToast('Codigo SKU requerido.', 'error')
      return false
    }
    if (!nombre.trim()) {
      showGlobalToast('Nombre requerido.', 'error')
      return false
    }
    const pesoValue = Number(peso)
    if (!pesoValue || Number.isNaN(pesoValue) || pesoValue <= 0) {
      showGlobalToast('Peso valido requerido.', 'error')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        producto_id: productoId,
        codigo_sku: `${skuPrefix}${codigoSku.trim()}`,
        nombre: nombre.trim(),
        peso_gramos: Number(peso),
      }

      const result = isEditing && sku?.id
        ? await CatalogSkuService.updateSku(sku.id, payload)
        : await CatalogSkuService.createSku(payload)

      if (!result) throw new Error('SAVE_ERROR')
      showGlobalToast(isEditing ? 'SKU actualizado.' : 'SKU creado.', 'success')
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
        title={isEditing ? 'Editar SKU' : 'Nuevo SKU'}
        variant="standard"
        onBackPress={() => navigation.goBack()}
        rightElement={<SupervisorHeaderMenu />}
      />

      <KeyboardFormLayout>
        <View className="px-5 py-4 gap-5">
          <View className="bg-white rounded-3xl border border-neutral-200 p-5 gap-4">
              <View>
                <Text className="text-lg font-bold text-neutral-900">
                  {isEditing ? 'Informacion del SKU' : 'Crear SKU'}
                </Text>
                <Text className="text-sm text-neutral-500">
                  Define la presentacion del producto.
                </Text>
              </View>

              <ComboBox
                label="Producto"
                options={productOptions}
                value={productoId}
                onValueChange={(value) => setProductoId(String(value))}
                placeholder="Seleccionar producto"
                description="El SKU se asocia a un producto base."
              />

              <TextField
                label="Codigo SKU"
                placeholder="0001"
                value={codigoSku}
                onChangeText={setCodigoSku}
                autoCapitalize="characters"
                left={<Text className="text-neutral-900 font-semibold">{skuPrefix}</Text>}
              />
              <TextField
                label="Nombre"
                placeholder="Presentacion 500g"
                value={nombre}
                onChangeText={setNombre}
              />
              <TextField
                label="Peso (gramos)"
                placeholder="500"
                value={peso}
                onChangeText={setPeso}
                keyboardType="number-pad"
              />

              <PrimaryButton title={isEditing ? 'Guardar cambios' : 'Crear SKU'} onPress={handleSave} loading={saving || loading} />
          </View>
        </View>
      </KeyboardFormLayout>
    </View>
  )
}
