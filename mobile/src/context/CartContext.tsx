import React from 'react'
import type { UserClient } from '../services/api/UserClientService'

export type CartItem = {
    id: string
    skuId: string
    skuName: string
    skuCode: string
    productId: string
    productName: string
    price: number
    quantity: number
    image?: string
    categoryName?: string
    discountType?: 'porcentaje' | 'monto_fijo'
    discountValue?: number
    priceOrigin?: 'catalogo' | 'negociado'
    requiresApproval?: boolean
}

type CartContextValue = {
    items: CartItem[]
    selectedClient: UserClient | null
    paymentMethod: 'contado' | 'credito'
    setPaymentMethod: (method: 'contado' | 'credito') => void
    setClient: (client: UserClient | null) => void
    addItem: (item: CartItem) => void
    updateQuantity: (skuId: string, quantity: number) => void
    updateItemDiscount: (skuId: string, discount: {
        discountType?: 'porcentaje' | 'monto_fijo'
        discountValue?: number
        priceOrigin?: 'catalogo' | 'negociado'
        requiresApproval?: boolean
    }) => void
    removeItem: (skuId: string) => void
    clear: () => void
    getItemCount: () => number
    getTotals: () => { subtotal: number; tax: number; total: number }
    getItemUnitPrice: (skuId: string) => number
}

const CartContext = React.createContext<CartContextValue | null>(null)

const TAX_RATE = 0.15

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = React.useState<CartItem[]>([])
    const [selectedClient, setSelectedClient] = React.useState<UserClient | null>(null)
    const [paymentMethod, setPaymentMethod] = React.useState<'contado' | 'credito'>('contado')

    const addItem = React.useCallback((incoming: CartItem) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.skuId === incoming.skuId)
            if (!existing) {
                return [...prev, incoming]
            }
            return prev.map((item) =>
                item.skuId === incoming.skuId
                    ? { ...item, quantity: item.quantity + incoming.quantity }
                    : item
            )
        })
    }, [])

    const updateQuantity = React.useCallback((skuId: string, quantity: number) => {
        setItems((prev) =>
            prev
                .map((item) => (item.skuId === skuId ? { ...item, quantity } : item))
                .filter((item) => item.quantity > 0)
        )
    }, [])

    const updateItemDiscount = React.useCallback((skuId: string, discount: {
        discountType?: 'porcentaje' | 'monto_fijo'
        discountValue?: number
        priceOrigin?: 'catalogo' | 'negociado'
        requiresApproval?: boolean
    }) => {
        setItems((prev) =>
            prev.map((item) =>
                item.skuId === skuId
                    ? {
                        ...item,
                        discountType: discount.discountType,
                        discountValue: discount.discountValue,
                        priceOrigin: discount.priceOrigin,
                        requiresApproval: discount.requiresApproval ?? false,
                    }
                    : item
            )
        )
    }, [])

    const removeItem = React.useCallback((skuId: string) => {
        setItems((prev) => prev.filter((item) => item.skuId !== skuId))
    }, [])

    const clear = React.useCallback(() => {
        setItems([])
        setSelectedClient(null)
        setPaymentMethod('contado')
    }, [])

    const getItemCount = React.useCallback(() => {
        return items.reduce((total, item) => total + item.quantity, 0)
    }, [items])

    const getItemUnitPrice = React.useCallback((skuId: string) => {
        const item = items.find((entry) => entry.skuId === skuId)
        if (!item) {
            return 0
        }
        const base = item.price
        const tipo = item.discountType
        const valor = item.discountValue
        if (!tipo || !valor || valor <= 0) {
            return base
        }
        if (tipo === 'porcentaje') {
            return Number((base * (1 - valor / 100)).toFixed(2))
        }
        return Number(Math.max(0, base - valor).toFixed(2))
    }, [items])

    const getTotals = React.useCallback(() => {
        const subtotal = items.reduce((sum, item) => {
            const unitPrice = getItemUnitPrice(item.skuId)
            return sum + unitPrice * item.quantity
        }, 0)
        const tax = subtotal * TAX_RATE
        const total = subtotal + tax
        return { subtotal, tax, total }
    }, [items, getItemUnitPrice])

    const value = React.useMemo<CartContextValue>(() => ({
        items,
        selectedClient,
        paymentMethod,
        setPaymentMethod,
        setClient: setSelectedClient,
        addItem,
        updateQuantity,
        updateItemDiscount,
        removeItem,
        clear,
        getItemCount,
        getTotals,
        getItemUnitPrice,
    }), [items, selectedClient, paymentMethod, addItem, updateQuantity, updateItemDiscount, removeItem, clear, getItemCount, getTotals, getItemUnitPrice])

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCartOptional() {
    return React.useContext(CartContext)
}

export function useCart() {
    const ctx = useCartOptional()
    if (!ctx) {
        throw new Error('CartContext is missing')
    }
    return ctx
}
