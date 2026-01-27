import { useState, useEffect } from 'react'
import { StockItem } from '../../../services/stockApi'
import { Product } from '../../../../supervisor/services/productosApi'
import { getSelectedRole } from '../../../../../services/storage/roleStorage'

export function useStockPage() {
    const [stock, setStock] = useState<StockItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
    const [selectedStock, setSelectedStock] = useState<StockItem | null>(null)

    const [products, setProducts] = useState<Product[]>([])
    const [selectedProduct, setSelectedProduct] = useState<string>('')
    const role = getSelectedRole()

    useEffect(() => {
        setProducts([])
    }, [])

    useEffect(() => {
        fetchStock()
    }, [selectedProduct])

    const fetchStock = async () => {
        setLoading(false)
        setStock([])
    }

    const handleOpenAdjust = (item: StockItem) => {
        setSelectedStock(item)
        setIsAdjustModalOpen(true)
    }

    const handleCloseAdjust = () => {
        setIsAdjustModalOpen(false)
        setSelectedStock(null)
    }

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false)
        fetchStock()
    }

    const handleAdjustSuccess = () => {
        handleCloseAdjust()
        fetchStock()
    }

    return {
        // State
        stock,
        loading,
        error,
        isCreateModalOpen,
        isAdjustModalOpen,
        selectedStock,
        products,
        selectedProduct,
        role,

        // Setters
        setIsCreateModalOpen,
        setSelectedProduct,

        // Handlers
        handleOpenAdjust,
        handleCloseAdjust,
        handleCreateSuccess,
        handleAdjustSuccess
    }
}
