import { useState, useEffect } from 'react'
import { Modal } from '../../../../../components/ui/Modal'
import { LoadingSpinner } from '../../../../../components/ui/LoadingSpinner'
import { Alert } from '../../../../../components/ui/Alert'
import { ValidationItemRow } from './ValidationItemRow'
import { getAllSkus, type CatalogSku } from '../../../../supervisor/services/skusApi'
import { validarPedido, type ValidacionItemResult, EstadoItemResultado } from '../../../services/validationsApi'
import type { Pedido } from '../../../../supervisor/services/pedidosApi'

interface ValidationModalProps {
    pedido: Pedido | null
    onClose: () => void
    onSuccess: () => void
}

export function ValidationModal({ pedido, onClose, onSuccess }: ValidationModalProps) {
    const [skus, setSkus] = useState<CatalogSku[]>([])
    const [isLoadingSkus, setIsLoadingSkus] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [results, setResults] = useState<Map<string, ValidacionItemResult>>(new Map())
    const [observaciones, setObservaciones] = useState('')

    useEffect(() => {
        if (pedido) {
            loadSkus()
            // Init results with default Approved
            const initialMap = new Map<string, ValidacionItemResult>()
            pedido.detalles?.forEach(d => {
                initialMap.set(d.id, {
                    item_pedido_id: d.id,
                    estado_resultado: EstadoItemResultado.APROBADO,
                    cantidad_aprobada: undefined,
                    motivo: ''
                })
            })
            setResults(initialMap)
        }
    }, [pedido])

    const loadSkus = async () => {
        try {
            setIsLoadingSkus(true)
            const data = await getAllSkus()
            setSkus(data.filter(s => s.activo))
        } catch (e) {
            setError('Error al cargar catálogo de SKUs')
        } finally {
            setIsLoadingSkus(false)
        }
    }

    const handleRowChange = (res: ValidacionItemResult) => {
        setResults(prev => new Map(prev).set(res.item_pedido_id, res))
    }

    // Derived validation state
    const itemsArray = Array.from(results.values())
    const totalDetalles = pedido?.detalles?.length || 0
    const missingItems = itemsArray.length !== totalDetalles
    const missingReasons = itemsArray.some(i => i.estado_resultado !== EstadoItemResultado.APROBADO && !i.motivo.trim())
    const missingSku = itemsArray.some(i => i.estado_resultado === EstadoItemResultado.SUSTITUIDO && !i.sku_aprobado_id)
    const isFormValid = !missingItems && !missingReasons && !missingSku

    const counts = itemsArray.reduce(
        (acc, cur) => {
            acc[cur.estado_resultado] = (acc[cur.estado_resultado] || 0) + 1
            return acc
        }, {} as Record<string, number>
    )

    const handleSubmit = async () => {
        if (!pedido) return
        try {
            setIsSubmitting(true)
            setError(null)

            // Validate completeness
            const items = Array.from(results.values())
            if (items.length !== (pedido.detalles?.length || 0)) {
                setError('Faltan ítems por validar')
                return
            }

            // Validate reasons for non-approved (Frontend check)
            const missingReasons = items.some(i =>
                i.estado_resultado !== EstadoItemResultado.APROBADO && !i.motivo.trim()
            )
            if (missingReasons) {
                setError('Debe ingresar un motivo para los ítems no aprobados')
                return
            }

            // Validate substitutions
            const missingSku = items.some(i =>
                i.estado_resultado === EstadoItemResultado.SUSTITUIDO && !i.sku_aprobado_id
            )
            if (missingSku) {
                setError('Debe seleccionar un SKU para los ítems sustituidos')
                return
            }

            // Log items to help debug validations (temporal)
            await validarPedido(pedido.id, items, observaciones)
            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message || 'Error al guardar la validación')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal
            isOpen={!!pedido}
            title={`Validar Pedido #${pedido?.codigo_visual || ''}`}
            onClose={onClose}
            headerGradient="red"
            maxWidth="2xl"
        >
            <div className="space-y-6">
                {error && <Alert type="error" message={error} />}

                {isLoadingSkus ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <>
                        {/* Summary */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 text-sm text-gray-700">
                                <strong>Ítems:</strong> {totalDetalles}
                                {missingItems && <span className="ml-2 text-xs text-red-600">Faltan {totalDetalles - itemsArray.length} ítems por validar</span>}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Aprobado {counts[EstadoItemResultado.APROBADO] ?? 0}</span>
                                <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">Parcial {counts[EstadoItemResultado.APROBADO_PARCIAL] ?? 0}</span>
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">Sustituido {counts[EstadoItemResultado.SUSTITUIDO] ?? 0}</span>
                                <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">Rechazado {counts[EstadoItemResultado.RECHAZADO] ?? 0}</span>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        Por favor revise cada ítem. Si modifica el estado a algo diferente de "Aprobado", deberá ingresar un motivo.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="w-full max-h-[48vh] overflow-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 w-1/3">Producto Solicitado</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 w-2/3">Validación Bodega</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {pedido?.detalles?.map(item => (
                                            <ValidationItemRow
                                                key={item.id}
                                                item={item}
                                                skus={skus}
                                                onChange={handleRowChange}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Observaciones Generales</label>
                            <textarea
                                rows={3}
                                value={observaciones}
                                onChange={e => setObservaciones(e.target.value)}
                                className="shadow-sm focus:ring-brand-red focus:border-brand-red block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="Comentarios adicionales sobre la validación..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 sticky bottom-0 bg-white">
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !isFormValid}
                                className="px-4 py-2 bg-brand-red text-white text-sm font-medium rounded-lg hover:bg-brand-red/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting && <LoadingSpinner className="w-4 h-4 text-white" />}
                                Confirmar Validación
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    )
}

