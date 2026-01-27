import { useState, useEffect } from 'react'

export function useVendedor() {
    const [vendedorId, setVendedorId] = useState<string | null>(null)

    useEffect(() => {
        // Mock implementation
        setVendedorId('mock-vendedor-id')
    }, [])

    return {
        vendedorId,
        loading: false
    }
}
