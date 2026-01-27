import { Modal } from 'components/ui/Modal'
import { Tag, Calendar, DollarSign, History, Edit2, Package } from 'lucide-react'
import { type CatalogSkuPrice } from '../../../services/preciosApi'

interface PrecioDetailModalProps {
    isOpen: boolean
    onClose: () => void
    onUpdate: (skuId: string) => void
    item: any | null // SKU mixed with currentPrice info
    history: CatalogSkuPrice[]
    isLoadingHistory: boolean
}

export function PrecioDetailModal({
    isOpen,
    onClose,
    onUpdate,
    item,
    history,
    isLoadingHistory
}: PrecioDetailModalProps) {
    if (!item) return null

    const currentPrice = item.currentPrice

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalle de precio">
            <div className="flex flex-col gap-6 p-1 max-h-[85vh] overflow-y-auto">
                {/* Main Info Card */}
                <div className="relative rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
                    <div className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 shadow-sm">
                        <DollarSign className="h-6 w-6" />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">SKU</span>
                            <h3 className="text-xl font-bold text-neutral-900 leading-tight">{item.codigo_sku}</h3>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-neutral-600">Presentación {item.nombre}</p>
                            <p className="text-sm text-neutral-500 flex items-center gap-1">
                                Producto: {item.producto?.nombre || 'N/A'}
                            </p>
                        </div>

                        <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-neutral-600">Precio vigente</span>
                            <span className="text-lg font-bold text-neutral-900">
                                {currentPrice ? `${currentPrice.moneda} ${Number(currentPrice.precio).toFixed(2)}` : 'No asignado'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => {
                        onUpdate(item.id)
                        onClose()
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red py-3.5 text-base font-bold text-white shadow-lg shadow-red-200 transition-all hover:bg-brand-red/90 active:scale-[0.98]"
                >
                    <Edit2 className="h-5 w-5" />
                    Actualizar precio
                </button>

                {/* History Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-neutral-400" />
                        <h4 className="text-base font-bold text-neutral-900">Historial de precios</h4>
                    </div>

                    <div className="space-y-3">
                        {isLoadingHistory ? (
                            <div className="py-8 text-center text-neutral-400 text-sm">Cargando historial...</div>
                        ) : history.length > 0 ? (
                            history.map((h, idx) => (
                                <div key={h.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-full before:w-0.5 before:bg-neutral-100 last:before:h-2">
                                    <div className="absolute left-[-4px] top-2 h-2.5 w-2.5 rounded-full bg-neutral-200 ring-4 ring-white" />
                                    <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-neutral-400">
                                                {new Date(h.vigente_desde).toLocaleDateString()}
                                            </span>
                                            <span className={`text-sm font-bold ${idx === 0 ? 'text-brand-red' : 'text-neutral-500'}`}>
                                                {h.moneda} {Number(h.precio).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-neutral-200 py-8 text-center">
                                <p className="text-sm text-neutral-500">No hay historial disponible</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    )
}
