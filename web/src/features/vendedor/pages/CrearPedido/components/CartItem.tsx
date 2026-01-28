

import { Trash2, Plus, Minus, Tag } from 'lucide-react'
import type { CartItem as CartItemType } from '../types'
import { useState } from 'react'

interface CartItemProps {
    item: CartItemType
    onUpdateQuantity: (quantity: number) => void
    onUpdateNegotiation?: (updates: any) => void
    onRemove: () => void
}

export function CartItem({ item, onUpdateQuantity, onUpdateNegotiation, onRemove }: CartItemProps) {
    const [showDiscount, setShowDiscount] = useState(false)

    // Helper to calculate subtotal with current discounts
    const getSubtotal = () => {
        let price = item.precio_unitario_final !== undefined ? item.precio_unitario_final : item.producto.price
        if (item.precio_unitario_final === undefined) {
            if (item.descuento_item_tipo === 'porcentaje' && item.descuento_item_valor) {
                price = price * (1 - item.descuento_item_valor / 100)
            } else if (item.descuento_item_tipo === 'monto' && item.descuento_item_valor) {
                price = price - item.descuento_item_valor
            }
        }
        return (price * item.cantidad).toFixed(2)
    }

    const handleDiscountChange = (type: string, value: string) => {
        if (!onUpdateNegotiation) return
        const numValue = parseFloat(value)
        onUpdateNegotiation({
            descuento_item_tipo: type,
            descuento_item_valor: isNaN(numValue) ? undefined : numValue
        })
    }

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-900">{item.producto.name}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-neutral-500">Precio base: ${item.producto.price.toFixed(2)}</p>
                        {(item.producto as any).skuCode && <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-[10px] text-neutral-600">SKU: {(item.producto as any).skuCode}</span>}
                    </div>
                </div>
                <button
                    type="button"
                    aria-label="Eliminar"
                    onClick={() => onRemove()}
                    className="rounded-lg bg-red-50 p-2 text-brand-red hover:bg-red-100"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <div className="flex items-center justify-between gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onUpdateQuantity(Math.max(item.cantidad - 1, 0))}
                        className="rounded-lg border border-neutral-200 bg-neutral-50 p-1 text-neutral-700 hover:bg-neutral-100"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.cantidad}</span>
                    <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.cantidad + 1)}
                        className="rounded-lg border border-neutral-200 bg-neutral-50 p-1 text-neutral-700 hover:bg-neutral-100"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                <div className="text-right">
                    <span className="text-sm font-bold text-neutral-900">${getSubtotal()}</span>
                </div>
            </div>

            {/* Negotiation Section */}
            {onUpdateNegotiation && (
                <div className="border-t border-neutral-100 pt-2">
                    {!showDiscount && !item.descuento_item_valor ? (
                        <button
                            onClick={() => setShowDiscount(true)}
                            className="text-xs text-brand-red font-medium flex items-center gap-1 hover:underline"
                        >
                            <Tag className="w-3 h-3" /> Agregar descuento
                        </button>
                    ) : (
                        <div className="bg-neutral-50 rounded-lg p-2 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1"> <Tag className="w-3 h-3" /> Descuento</span>
                                <button onClick={() => { setShowDiscount(false); handleDiscountChange('porcentaje', '') }} className="text-[10px] text-neutral-400 hover:text-neutral-600">Quitar</button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    className="text-xs rounded border border-neutral-200 p-1"
                                    value={item.descuento_item_tipo || 'porcentaje'}
                                    onChange={(e) => handleDiscountChange(e.target.value, String(item.descuento_item_valor || ''))}
                                >
                                    <option value="porcentaje">% Porcentaje</option>
                                    <option value="monto">$ Monto Fijo</option>
                                </select>
                                <input
                                    type="number"
                                    className="text-xs rounded border border-neutral-200 p-1 w-full"
                                    placeholder="Valor"
                                    value={item.descuento_item_valor || ''}
                                    onChange={(e) => handleDiscountChange(item.descuento_item_tipo || 'porcentaje', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
