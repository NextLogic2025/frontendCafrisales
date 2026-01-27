import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { ProductCatalogTemplate } from '../../../../components/catalog/ProductCatalogTemplate'
import { SkuPickerModal } from '../../../../components/catalog/SkuPickerModal'
import { SellerHeaderMenu } from '../../../../components/ui/SellerHeaderMenu'
import { CatalogProduct, CatalogProductService } from '../../../../services/api/CatalogProductService'
import { useCart } from '../../../../context/CartContext'
import { showGlobalToast } from '../../../../utils/toastService'

export function SellerProductsScreen() {
  const navigation = useNavigation<any>()
  const cart = useCart()
  const [pickerVisible, setPickerVisible] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<CatalogProduct | null>(null)
  const [selectedSkuId, setSelectedSkuId] = React.useState<string | null>(null)
  const [quantity, setQuantity] = React.useState(1)

  const openPicker = async (product: CatalogProduct) => {
    setSelectedProduct(product)
    setSelectedSkuId(null)
    setQuantity(1)
    setPickerVisible(true)

    if (!product.skus || product.skus.length === 0) {
      const fresh = await CatalogProductService.getProduct(product.id)
      if (fresh) {
        setSelectedProduct(fresh)
      }
    }
  }

  const handleConfirm = () => {
    if (!selectedProduct) return
    const sku = selectedProduct.skus?.find((item) => item.id === selectedSkuId)
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
      productId: selectedProduct.id,
      productName: selectedProduct.nombre,
      price: parsedPrice,
      quantity,
      image: selectedProduct.img_url ?? undefined,
      categoryName: selectedProduct.categoria?.nombre ?? 'Catalogo',
    })
    setPickerVisible(false)
    showGlobalToast(`Se agrego ${sku.nombre} al carrito`, 'success')
  }

  return (
    <>
      <ProductCatalogTemplate
        title="Productos"
        onProductPress={(product) => navigation.navigate('SellerProductDetail', { productId: product.id })}
        onQuickAdd={openPicker}
        headerRightElement={<SellerHeaderMenu />}
      />
      <SkuPickerModal
        visible={pickerVisible}
        title={selectedProduct ? `Agregar ${selectedProduct.nombre}` : 'Selecciona SKU'}
        skus={selectedProduct?.skus ?? []}
        selectedSkuId={selectedSkuId}
        quantity={quantity}
        onSelectSku={setSelectedSkuId}
        onQuantityChange={setQuantity}
        onClose={() => setPickerVisible(false)}
        onConfirm={handleConfirm}
      />
    </>
  )
}
