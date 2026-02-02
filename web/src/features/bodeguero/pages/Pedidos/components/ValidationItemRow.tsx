import { useState, useEffect } from 'react'
import { Check, AlertTriangle, XCircle, RefreshCw, Search } from 'components/ui/Icons'
import { EstadoItemResultado } from '../../../services/validationsApi'
import type { DetallePedido } from '../../../../supervisor/services/pedidosApi'
import type { CatalogSku } from '../../../../supervisor/services/skusApi'

interface ValidationItemRowProps {
    item: DetallePedido
    skus: CatalogSku[]
    onChange: (result: {
        item_pedido_id: string
        estado_resultado: EstadoItemResultado
        cantidad_aprobada?: number
        sku_aprobado_id?: string
        motivo: string
    }) => void
}

export function ValidationItemRow({ item, skus, onChange }: ValidationItemRowProps) {
    const [estado, setEstado] = useState<EstadoItemResultado>(EstadoItemResultado.APROBADO)
    const [cantidad, setCantidad] = useState<number>(Number(item.cantidad))
    const [skuSearch, setSkuSearch] = useState('')
    const [selectedSku, setSelectedSku] = useState<CatalogSku | null>(null)
    const [motivo, setMotivo] = useState('')

    // Init default state
    useEffect(() => {
        reportChange(estado, cantidad, selectedSku?.id, motivo)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const reportChange = (
        newEstado: EstadoItemResultado,
        newCantidad: number,
        newSkuId: string | undefined,
        newMotivo: string
    ) => {
        // Logic to clear/set defaults based on state
        let finalCantidad = newCantidad
        let finalSkuId = newSkuId

        if (newEstado === EstadoItemResultado.APROBADO) {
            finalCantidad = Number(item.cantidad)
            finalSkuId = undefined
        } else if (newEstado === EstadoItemResultado.RECHAZADO) {
            finalCantidad = 0
            finalSkuId = undefined
        }

        onChange({
            item_pedido_id: item.id,
            estado_resultado: newEstado,
            cantidad_aprobada: newEstado === EstadoItemResultado.APROBADO ? undefined : finalCantidad,
            sku_aprobado_id: finalSkuId,
            motivo: newMotivo
        })
    }

    const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newEstado = e.target.value as EstadoItemResultado
        setEstado(newEstado)

        // Default quantity adjustments
        let nextCantidad = cantidad
        if (newEstado === EstadoItemResultado.APROBADO) {
            nextCantidad = Number(item.cantidad)
        } else if (newEstado === EstadoItemResultado.RECHAZADO) {
            nextCantidad = 0
        } else if (cantidad === 0) {
            // Restore original quantity if it was zeroed out by a previous "Rejected" choice
            nextCantidad = Number(item.cantidad)
        }

        setCantidad(nextCantidad)
        reportChange(newEstado, nextCantidad, selectedSku?.id, motivo)
    }

    const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Number(e.target.value)
        setCantidad(val)
        reportChange(estado, val, selectedSku?.id, motivo)
    }

    const handleMotivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMotivo(e.target.value)
        reportChange(estado, cantidad, selectedSku?.id, e.target.value)
    }

    // Filter SKUs for autocomplete
    const filteredSkus = skuSearch
        ? skus.filter(s =>
            s.nombre.toLowerCase().includes(skuSearch.toLowerCase()) ||
            s.codigo_sku.toLowerCase().includes(skuSearch.toLowerCase())
        ).slice(0, 5)
        : []

    return (
        <tr className="border-b last:border-0 hover:bg-gray-50">
            <td className="px-4 py-3 align-top">
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{item.nombre_producto}</span>
                    <span className="text-xs text-gray-500">SKU: {item.codigo_sku}</span>
                    <span className="text-xs text-gray-500">Solicitado: {item.cantidad} {item.unidad_medida}</span>
                </div>
            </td>

            <td className="px-4 py-3 align-top">
                <div className="space-y-2">
                    <select
                        value={estado}
                        onChange={handleEstadoChange}
                        className={`w-full text-sm rounded-lg border p-2 font-medium focus:ring-2 focus:ring-brand-red ${estado === EstadoItemResultado.APROBADO ? 'bg-green-50 text-green-700 border-green-200' :
                            estado === EstadoItemResultado.APROBADO_PARCIAL ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                estado === EstadoItemResultado.SUSTITUIDO ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                            }`}
                    >
                        <option value={EstadoItemResultado.APROBADO}>✅ Aprobado</option>
                        <option value={EstadoItemResultado.APROBADO_PARCIAL}>⚠️ Parcial</option>
                        <option value={EstadoItemResultado.SUSTITUIDO}>🔁 Sustituido</option>
                        <option value={EstadoItemResultado.RECHAZADO}>❌ Rechazado</option>
                    </select>

                    {/* Logic specific inputs */}

                    {estado === EstadoItemResultado.APROBADO_PARCIAL && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">Cant:</span>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                max={item.cantidad}
                                value={cantidad}
                                onChange={handleCantidadChange}
                                className="w-20 text-sm border rounded p-1"
                            />
                            <span className="text-xs text-gray-500">of {item.cantidad}</span>
                        </div>
                    )}

                    {estado === EstadoItemResultado.SUSTITUIDO && (
                        <div className="space-y-1 relative">
                            <div className="relative">
                                <Search className="w-3 h-3 absolute left-2 top-2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar SKU..."
                                    value={skuSearch}
                                    onChange={e => setSkuSearch(e.target.value)}
                                    className="w-full pl-7 text-xs border rounded p-1.5"
                                />
                            </div>
                            {skuSearch && !selectedSku && (
                                <div className="absolute top-full left-0 w-full bg-white border rounded shadow-lg z-10 max-h-40 overflow-auto">
                                    {filteredSkus.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => {
                                                setSelectedSku(s)
                                                setSkuSearch(s.nombre)
                                                reportChange(estado, cantidad, s.id, motivo)
                                            }}
                                            className="w-full text-left px-2 py-1 hover:bg-gray-100 text-xs truncate"
                                        >
                                            {s.codigo_sku} - {s.nombre}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedSku && (
                                <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                    <span className="truncate flex-1">{selectedSku.codigo_sku}</span>
                                    <button onClick={() => {
                                        setSelectedSku(null)
                                        setSkuSearch('')
                                        reportChange(estado, cantidad, undefined, motivo)
                                    }}>
                                        <XCircle className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-600">Cant:</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={cantidad}
                                    onChange={handleCantidadChange}
                                    className="w-20 text-sm border rounded p-1"
                                />
                            </div>
                        </div>
                    )}

                    <input
                        type="text"
                        placeholder={estado === EstadoItemResultado.APROBADO ? "Observación (opcional)" : "Motivo (requerido)"}
                        value={motivo}
                        onChange={handleMotivoChange}
                        className={`w-full text-xs border rounded p-1.5 ${!motivo && estado !== EstadoItemResultado.APROBADO ? 'border-red-300' : 'border-gray-200'}`}
                    />
                </div>
            </td>
        </tr>
    )
}
