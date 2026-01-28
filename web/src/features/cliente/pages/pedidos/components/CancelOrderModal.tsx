import { AlertTriangle, X } from 'lucide-react'
import { COLORES_MARCA } from '../../../types'

interface CancelOrderModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    orderNumber: string
}

export function CancelOrderModal({ isOpen, onClose, onConfirm, orderNumber }: CancelOrderModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transform transition-all scale-100">
                <div className="flex justify-end p-4">
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-6 pb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>

                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                        ¿Cancelar Pedido?
                    </h3>

                    <p className="mb-6 text-sm text-gray-500">
                        Estás a punto de cancelar el pedido <span className="font-bold text-gray-700">#{orderNumber}</span>.
                        Esta acción no se puede deshacer.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
                        >
                            No, mantener
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 active:scale-95"
                            style={{ backgroundColor: COLORES_MARCA.red }}
                        >
                            Sí, cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
