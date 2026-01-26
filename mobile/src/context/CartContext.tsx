import React from 'react'

type CartContextValue = {
    getItemCount: () => number
}

const CartContext = React.createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const value = React.useMemo<CartContextValue>(() => ({
        getItemCount: () => 0
    }), [])

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
