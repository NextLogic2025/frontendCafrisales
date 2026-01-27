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
}

type CartContextValue = {
    items: CartItem[]
    selectedClient: UserClient | null
    paymentMethod: 'contado' | 'credito'
    setPaymentMethod: (method: 'contado' | 'credito') => void
    setClient: (client: UserClient | null) => void
    addItem: (item: CartItem) => void
    updateQuantity: (skuId: string, quantity: number) => void
    removeItem: (skuId: string) => void
    clear: () => void
    getItemCount: () => number
    getTotals: () => { subtotal: number; tax: number; total: number }
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

    const getTotals = React.useCallback(() => {
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const tax = subtotal * TAX_RATE
        const total = subtotal + tax
        return { subtotal, tax, total }
    }, [items])

    const value = React.useMemo<CartContextValue>(() => ({
        items,
        selectedClient,
        paymentMethod,
        setPaymentMethod,
        setClient: setSelectedClient,
        addItem,
        updateQuantity,
        removeItem,
        clear,
        getItemCount,
        getTotals,
    }), [items, selectedClient, paymentMethod, addItem, updateQuantity, removeItem, clear, getItemCount, getTotals])

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
