
import React from 'react'
import { X, ShoppingCart, Info } from 'components/ui/Icons'
import type { Producto } from '../types'

interface SkuSelectionModalProps {
    producto: Producto
    isOpen: boolean
    onClose: () => void
    onConfirm: (sku: any) => void
}

export default function SkuSelectionModal({ producto, isOpen, onClose, onConfirm }: SkuSelectionModalProps) {
    if (!isOpen) return null

    const skus = producto.skus || []

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <ShoppingCart className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900 leading-tight">Seleccionar Presentación</h3>
                            <p className="text-xs text-neutral-500 font-medium">{producto.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {skus.length === 0 ? (
                        <div className="text-center py-8">
                            <Info className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-500 text-sm">No hay presentaciones disponibles para este producto.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 block">
                                Plataforma de SKUs disponibles
                            </label>
                            {skus.map((sku: any) => (
                                <button
                                    key={sku.id}
                                    onClick={() => onConfirm(sku)}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-neutral-100 hover:border-orange-500 hover:bg-orange-50/50 transition-all group text-left"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-bold text-neutral-900 group-hover:text-orange-900">
                                            {sku.presentacion || `SKU: ${sku.sku}`}
                                        </span>
                                        <span className="text-xs text-neutral-500">
                                            Código: {sku.sku}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-orange-600">
                                            ${Number(sku.precios?.[0]?.precio || 0).toFixed(2)}
                                        </div>
                                        <div className="text-[10px] text-neutral-400 font-bold uppercase">
                                            Precio Unitario
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-neutral-600 hover:bg-neutral-200 transition-colors text-sm"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
}
