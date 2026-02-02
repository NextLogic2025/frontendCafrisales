import React, { useEffect, useState } from 'react'
import { Modal } from 'components/ui/Modal'
import { Clock, User, FileText } from 'components/ui/Icons'
import type { HistorialEstadoRutero } from '../services/types'
import { ESTADO_RUTERO_LABELS } from '../services/types'
import { getHistorialRutero } from '../services/logisticsApi'
import { getHistorialRuta as getHistorialRutaComercial } from '../services/rutasVendedorApi'
import { ESTADO_RUTA_LABELS } from '../services/rutasVendedorTypes'

interface HistorialModalProps {
    isOpen: boolean
    onClose: () => void
    ruteroId: string
    tipo?: 'comercial' | 'logistico'
}

export function HistorialModal({ isOpen, onClose, ruteroId, tipo = 'logistico' }: HistorialModalProps) {
    const [historial, setHistorial] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && ruteroId) {
            loadHistorial()
        }
    }, [isOpen, ruteroId])

    const loadHistorial = async () => {
        setLoading(true)
        try {
            const data = tipo === 'comercial'
                ? await getHistorialRutaComercial(ruteroId)
                : await getHistorialRutero(ruteroId)
            setHistorial(data)
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Historial de Estados"
            headerGradient="red"
            maxWidth="lg"
        >
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mx-auto mb-4"></div>
                    <p className="text-neutral-600">Cargando historial...</p>
                </div>
            ) : historial.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                    <Clock className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                    <h3 className="text-lg font-semibold text-neutral-700">Sin historial</h3>
                    <p className="text-sm text-neutral-500 mt-2">
                        No hay cambios de estado registrados para este rutero.
                    </p>
                </div>
            ) : (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-neutral-200"></div>

                    {/* Timeline items */}
                    <div className="space-y-6">
                        {historial.map((item, index) => (
                            <div key={item.id} className="relative flex gap-4">
                                {/* Timeline dot */}
                                <div className="relative z-10 flex-shrink-0">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center ${index === 0
                                            ? 'bg-brand-red text-white'
                                            : 'bg-neutral-100 text-neutral-600'
                                            }`}
                                    >
                                        <Clock className="h-5 w-5" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-6">
                                    <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
                                        {/* Estado */}
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-lg text-neutral-800">
                                                {tipo === 'comercial'
                                                    ? ESTADO_RUTA_LABELS[item.estado as keyof typeof ESTADO_RUTA_LABELS]
                                                    : ESTADO_RUTERO_LABELS[item.estado as keyof typeof ESTADO_RUTERO_LABELS]}
                                            </h4>
                                            <span
                                                className={`text-xs font-medium px-2 py-1 rounded ${index === 0
                                                    ? 'bg-brand-red text-white'
                                                    : 'bg-neutral-100 text-neutral-600'
                                                    }`}
                                            >
                                                {index === 0 ? 'Actual' : 'Anterior'}
                                            </span>
                                        </div>

                                        {/* Usuario */}
                                        {item.usuario && (
                                            <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                                                <User className="h-4 w-4 text-neutral-400" />
                                                <span>
                                                    {item.usuario.nombre} {item.usuario.apellido || ''}
                                                </span>
                                            </div>
                                        )}

                                        {/* Fecha */}
                                        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                                            <Clock className="h-4 w-4 text-neutral-400" />
                                            <span>{formatDate(item.cambiado_en || item.creado_en)}</span>
                                        </div>

                                        {/* Observaciones */}
                                        {item.observaciones && (
                                            <div className="mt-3 pt-3 border-t border-neutral-100">
                                                <div className="flex items-start gap-2 text-sm">
                                                    <FileText className="h-4 w-4 text-neutral-400 mt-0.5" />
                                                    <div>
                                                        <span className="font-medium text-neutral-700 block mb-1">
                                                            Observaciones:
                                                        </span>
                                                        <p className="text-neutral-600">{item.observaciones}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-6 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-neutral-200 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-300 transition-all duration-150"
                >
                    Cerrar
                </button>
            </div>
        </Modal>
    )
}
