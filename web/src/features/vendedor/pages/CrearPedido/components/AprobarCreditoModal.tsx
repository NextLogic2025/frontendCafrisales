
import React, { useState } from 'react'
import { Modal } from '../../../../../components/ui/Modal'

interface AprobarCreditoModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (plazo: number, notas: string) => void
    initialPlazo?: number
    initialNotas?: string
}

export function AprobarCreditoModal({
    isOpen,
    onClose,
    onConfirm,
    initialPlazo = 30,
    initialNotas = ''
}: AprobarCreditoModalProps) {
    const [plazo, setPlazo] = useState(initialPlazo)
    const [notas, setNotas] = useState(initialNotas)

    const handleConfirm = (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onConfirm(plazo, notas)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Aprobar credito"
            headerGradient="red"
            maxWidth="md"
        >
            <div className="space-y-6 py-2">
                <p className="text-sm text-neutral-600">
                    El credito se aprobara despues de crear el pedido.
                </p>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                        Plazo en dias
                    </label>
                    <input
                        type="number"
                        value={plazo}
                        onChange={(e) => setPlazo(parseInt(e.target.value) || 0)}
                        className="w-full rounded-xl border border-neutral-200 p-4 text-lg focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                        Notas
                    </label>
                    <textarea
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        placeholder="Observaciones"
                        className="h-32 w-full resize-none rounded-xl border border-neutral-200 p-4 text-lg focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                    />
                </div>

                <button
                    type="button"
                    onClick={handleConfirm}
                    className="w-full rounded-2xl bg-brand-red py-4 text-lg font-bold text-white transition hover:bg-brand-red/90"
                >
                    Confirmar credito
                </button>
            </div>
        </Modal>
    )
}
