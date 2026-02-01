import * as React from 'react'
import { BackendCart, getCart, upsertCartItem, removeFromCart, clearCartRemote } from '../services/cartApi'
import { getToken } from '../../../services/storage/tokenStorage'

export type CartItem = {
  id: string // product id
  name: string
  unitPrice: number
  quantity: number
  // SKU support
  selectedSkuId?: string
  skuCode?: string
  presentacion?: string
}

type CartActionEvent = {
  type: 'add' | 'update'
  itemId: string
  name: string
  quantity: number
  timestamp: number
  skuId?: string
}

type CartContextValue = {
  items: CartItem[]
  total: number
  addItem: (item: CartItem) => void
  updateQuantity: (productId: string, quantity: number, skuId?: string) => void
  removeItem: (productId: string, skuId?: string) => void
  clearCart: () => void
  warnings: Array<{ issue: string }>
  removedItems: Array<{ producto_id: string; campania_aplicada_id?: number | null }>
  refreshCart: () => Promise<void>
  lastAction: CartActionEvent | null
  dismissLastAction: () => void
}

const CartContext = React.createContext<CartContextValue | null>(null)

const noop = () => { }
const noopAsync = async () => { }

const fallbackCartValue: CartContextValue = {
  items: [],
  total: 0,
  addItem: noop,
  updateQuantity: noop,
  removeItem: noop,
  clearCart: noop,
  warnings: [],
  removedItems: [],
  refreshCart: noopAsync,
  lastAction: null,
  dismissLastAction: noop,
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem('cafrilosa:cart')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem('cafrilosa:cart', JSON.stringify(items))
  } catch {
    // ignore
  }
}

function mapServerItems(cart: BackendCart, previous: CartItem[]): CartItem[] {
  if (!cart || !Array.isArray(cart.items)) return []
  const prevNameMap = new Map(previous.map(item => [item.id, item.name]))
  const prevPriceMap = new Map(previous.map(item => [item.id, item.unitPrice]))

  return cart.items
    .map((backendItem) => {
      const id = (backendItem.producto_id ?? backendItem.id ?? '').toString()
      if (!id) return null

      const quantity = Number(backendItem.cantidad ?? 0)
      if (!Number.isFinite(quantity) || quantity <= 0) return null

      const priceCandidate =
        backendItem.precio_unitario_ref ??
        backendItem.precio_final ??
        (backendItem as any).precio_unitario ??
        (backendItem as any).precio ??
        null
      const unitPrice = priceCandidate != null ? Number(priceCandidate) : prevPriceMap.get(id) ?? 0
      const name = (backendItem.producto_nombre ?? prevNameMap.get(id) ?? id).toString()
      const selectedSkuId = backendItem.selected_sku_id
      const skuCode = backendItem.sku_code
      const presentacion = backendItem.presentacion

      const cartItem: CartItem = { id, name, unitPrice, quantity, selectedSkuId, skuCode, presentacion }
      return cartItem
    })
    .filter((item): item is CartItem => item !== null)
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>(() => loadCart())
  const [warnings, setWarnings] = React.useState<Array<{ issue: string }>>([])
  const [removedItems, setRemovedItems] = React.useState<Array<{ producto_id: string; campania_aplicada_id?: number | null }>>([])
  const [lastAction, setLastAction] = React.useState<CartActionEvent | null>(null)
  const pendingRemovalsRef = React.useRef(new Set<string>())

  const inflightUpsertsRef = React.useRef(new Map<string, Promise<void>>())
  const syncTimersRef = React.useRef(new Map<string, number>())

  const applyServerSnapshot = React.useCallback((cart: BackendCart) => {
    setItems(prev => {
      const mapped = mapServerItems(cart, prev)
      const mappedIsEmpty = mapped.length === 0
      const hasLocalItems = prev.length > 0

      if (hasLocalItems && mappedIsEmpty) {
        // Preferimos mantener el carrito local cuando el backend devuelve un snapshot vacío/incompleto
        // para evitar que desaparezca después de agregar artículos desde el catálogo.
        return prev
      }

      saveCart(mapped)
      return mapped
    })
    setWarnings(Array.isArray(cart?.warnings) ? cart.warnings : [])
    setRemovedItems(Array.isArray(cart?.removed_items) ? cart.removed_items : [])
  }, [])

  const syncCartFromServer = React.useCallback(async () => {
    if (!getToken()) return
    try {
      const remote = await getCart()
      if (remote) applyServerSnapshot(remote)
    } catch {
      // ignore sync errors
    }
  }, [applyServerSnapshot])

  React.useEffect(() => {
    syncCartFromServer()
  }, [syncCartFromServer])

  const dismissLastAction = React.useCallback(() => setLastAction(null), [])

  const syncItemQuantity = React.useCallback(
    (productId: string, quantity: number, skuId?: string) => {
      if (!getToken()) return

      // Debounce: Clear existing timer
      const timerKey = skuId ? `${productId}:${skuId}` : productId
      if (syncTimersRef.current.has(timerKey)) {
        window.clearTimeout(syncTimersRef.current.get(timerKey))
      }

      const timerId = window.setTimeout(() => {
        syncTimersRef.current.delete(timerKey)
        const operation = (async () => {
          try {
            const resp = await upsertCartItem({
              producto_id: productId,
              cantidad: quantity,
              selected_sku_id: skuId
            })
            if (resp) applyServerSnapshot(resp)
          } catch {
            // ignore server errors, keep optimistic state
          } finally {
            inflightUpsertsRef.current.delete(timerKey)
          }
        })()
        inflightUpsertsRef.current.set(timerKey, operation)
      }, 500) // 500ms debounce

      syncTimersRef.current.set(timerKey, timerId)
    },
    [applyServerSnapshot],
  )

  const removeItem = React.useCallback(
    (productId: string, skuId?: string) => {
      setItems(prev => {
        const next = prev.filter(i => {
          if (i.id !== productId) return true
          if (skuId && i.selectedSkuId !== skuId) return true
          return false
        })
        saveCart(next)
        return next
      })

      const executeRemoteRemoval = () => {
        if (!getToken()) return
        const removalKey = skuId ? `${productId}:${skuId}` : productId
        if (pendingRemovalsRef.current.has(removalKey)) return
        pendingRemovalsRef.current.add(removalKey)
        removeFromCart(productId) // TODO: Backend support for removing specific SKU
          .catch(() => null)
          .finally(() => {
            pendingRemovalsRef.current.delete(removalKey)
            syncCartFromServer()
          })
      }

      const timerKey = skuId ? `${productId}:${skuId}` : productId
      const pendingUpsert = inflightUpsertsRef.current.get(timerKey)
      if (pendingUpsert) {
        pendingUpsert.finally(() => executeRemoteRemoval())
        return
      }
      executeRemoteRemoval()
    },
    [syncCartFromServer],
  )

  const addItem = React.useCallback(
    (item: CartItem) => {
      let nextQuantity = item.quantity
      setItems(prev => {
        const existing = prev.find(i => i.id === item.id && i.selectedSkuId === item.selectedSkuId)
        nextQuantity = (existing?.quantity ?? 0) + item.quantity
        const next = existing
          ? prev.map(i => (i.id === item.id && i.selectedSkuId === item.selectedSkuId ? { ...i, quantity: nextQuantity } : i))
          : [...prev, { ...item, quantity: nextQuantity }]
        saveCart(next)
        return next
      })
      setLastAction({ type: 'add', itemId: item.id, name: item.name, quantity: nextQuantity, timestamp: Date.now(), skuId: item.selectedSkuId })
      syncItemQuantity(item.id, nextQuantity, item.selectedSkuId)
    },
    [syncItemQuantity],
  )

  const updateQuantity = React.useCallback(
    (productId: string, quantity: number, skuId?: string) => {
      if (quantity <= 0) {
        removeItem(productId, skuId)
        return
      }

      const existing = items.find(i => i.id === productId && i.selectedSkuId === skuId)
      setItems(prev => {
        const hasItem = prev.some(i => i.id === productId && i.selectedSkuId === skuId)
        const next = hasItem
          ? prev.map(i => (i.id === productId && i.selectedSkuId === skuId ? { ...i, quantity } : i))
          : [...prev, { id: productId, name: existing?.name ?? 'Producto', unitPrice: existing?.unitPrice ?? 0, quantity, selectedSkuId: skuId }]
        saveCart(next)
        return next
      })

      setLastAction({ type: 'update', itemId: productId, name: existing?.name ?? 'Producto', quantity, timestamp: Date.now(), skuId: skuId })
      syncItemQuantity(productId, quantity, skuId)
    },
    [items, removeItem, syncItemQuantity],
  )

  const clearCart = React.useCallback(() => {
    setItems([])
    saveCart([])
    setWarnings([])
    setRemovedItems([])
    setLastAction(null)
    if (!getToken()) return
    clearCartRemote().catch(() => { })
  }, [])

  const total = React.useMemo(() => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), [items])

  const refreshCart = React.useCallback(() => syncCartFromServer(), [syncCartFromServer])

  const value = React.useMemo(
    () => ({
      items,
      total,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      warnings,
      removedItems,
      refreshCart,
      lastAction,
      dismissLastAction,
    }),
    [items, total, addItem, updateQuantity, removeItem, clearCart, warnings, removedItems, refreshCart, lastAction, dismissLastAction],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider />')
  return ctx
}

export function useCartOptional() {
  const ctx = React.useContext(CartContext)
  if (!ctx) {
    if (import.meta.env?.DEV) {
      // Intentional empty block for dev warning if needed, or just remove
    }
    return fallbackCartValue
  }
  return ctx
}
