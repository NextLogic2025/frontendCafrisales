import React from 'react'
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Header } from '../../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../../components/ui/SupervisorHeaderMenu'
import { TextField } from '../../../../../components/ui/TextField'
import { PrimaryButton } from '../../../../../components/ui/PrimaryButton'
import { ComboBox, ComboBoxOption } from '../../../../../components/ui/ComboBox'
import { CatalogSku, CatalogSkuService } from '../../../../../services/api/CatalogSkuService'
import { CatalogPriceService } from '../../../../../services/api/CatalogPriceService'
import { showGlobalToast } from '../../../../../utils/toastService'
import { getUserFriendlyMessage } from '../../../../../utils/errorMessages'

export function SupervisorPriceFormScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const skuParam: CatalogSku | null = route.params?.sku ?? null

  const [skus, setSkus] = React.useState<CatalogSku[]>([])
  const [skuId, setSkuId] = React.useState(skuParam?.id ?? '')
  const [precio, setPrecio] = React.useState('')
  const [moneda, setMoneda] = React.useState('USD')
  const [hasCurrentPrice, setHasCurrentPrice] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const loadSkus = React.useCallback(async () => {
    const data = await CatalogSkuService.getSkus()
    setSkus(data)
  }, [])

  const loadCurrentPrice = React.useCallback(async () => {
    if (!skuId) return
    setLoading(true)
    try {
      const current = await CatalogPriceService.getCurrentPrice(skuId)
      if (current) {
        setHasCurrentPrice(true)
        setPrecio(String(current.precio))
        setMoneda(current.moneda)
      } else {
        setHasCurrentPrice(false)
        setPrecio('')
        setMoneda('USD')
      }
    } finally {
      setLoading(false)
    }
  }, [skuId])

  React.useEffect(() => {
    loadSkus()
  }, [loadSkus])

  React.useEffect(() => {
    loadCurrentPrice()
  }, [loadCurrentPrice])

  const skuOptions: ComboBoxOption<string>[] = skus.map((sku) => ({
    value: sku.id,
    label: sku.codigo_sku,
    description: sku.nombre,
  }))

  const validate = () => {
    if (!skuId) {
      showGlobalToast('Selecciona un SKU.', 'error')
      return false
    }
    const priceValue = Number(precio)
    if (!priceValue || Number.isNaN(priceValue) || priceValue <= 0) {
      showGlobalToast('Precio valido requerido.', 'error')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const priceValue = Number(precio)
      const result = hasCurrentPrice
        ? await CatalogPriceService.updatePrice(skuId, { nuevo_precio: priceValue })
        : await CatalogPriceService.createPrice(skuId, { precio: priceValue, moneda })

      if (!result) throw new Error('SAVE_ERROR')
      showGlobalToast(hasCurrentPrice ? 'Precio actualizado.' : 'Precio creado.', 'success')
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
        title={hasCurrentPrice ? 'Actualizar precio' : 'Nuevo precio'}
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
                  {hasCurrentPrice ? 'Actualizar precio' : 'Registrar precio'}
                </Text>
                <Text className="text-sm text-neutral-500">
                  Ingresa el precio vigente para el SKU seleccionado.
                </Text>
              </View>

              <ComboBox
                label="SKU"
                options={skuOptions}
                value={skuId}
                onValueChange={(value) => setSkuId(String(value))}
                placeholder="Seleccionar SKU"
                description="El precio se guarda por SKU."
              />

              <TextField
                label="Precio"
                placeholder="0.00"
                value={precio}
                onChangeText={setPrecio}
                keyboardType="decimal-pad"
              />

              <TextField
                label="Moneda"
                placeholder="USD"
                value={moneda}
                onChangeText={setMoneda}
                editable={!hasCurrentPrice}
              />

              <PrimaryButton
                title={hasCurrentPrice ? 'Actualizar precio' : 'Guardar precio'}
                onPress={handleSave}
                loading={saving || loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}
