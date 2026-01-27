import { useState, useEffect } from 'react'
import { PageHero } from '../../../../components/ui/PageHero'
import { CreditCard, TrendingUp, AlertCircle, History, Filter, Loader2, Calendar, FileText } from 'lucide-react'
import { SectionHeader } from '../../../../components/ui/SectionHeader'
import { getCredits, getCreditDetail, type CreditListItem, type CreditDetail } from '../../services/creditosApi'
import { CreditDetailModal } from './components/CreditDetailModal'

type FilterType = 'TODOS' | 'APROBADO' | 'PENDIENTES' | 'PAGADOS' | 'RECHAZADOS'

const FILTER_MAPPING: Record<FilterType, string[]> = {
    'TODOS': [],
    'APROBADO': ['activo'],
    'PENDIENTES': ['vencido'],
    'PAGADOS': ['pagado'],
    'RECHAZADOS': ['cancelado']
}

export default function VendedorCredito() {
    const [filter, setFilter] = useState<FilterType>('TODOS')
    const [credits, setCredits] = useState<CreditListItem[]>([])
    const [loading, setLoading] = useState(true)

    // Detalle de crédito
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [selectedDetail, setSelectedDetail] = useState<CreditDetail | null>(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

    const handleViewDetail = async (id: string) => {
        setIsDetailOpen(true)
        setLoadingDetail(true)
        try {
            const data = await getCreditDetail(id)
            setSelectedDetail(data)
        } catch (error) {
            console.error('Error fetching credit detail:', error)
        } finally {
            setLoadingDetail(false)
        }
    }

    const closeDetail = () => {
        setIsDetailOpen(false)
        setSelectedDetail(null)
    }

    useEffect(() => {
        const fetchCredits = async () => {
            setLoading(true)
            try {
                const data = await getCredits(FILTER_MAPPING[filter])
                setCredits(data)
            } catch (error) {
                console.error('Error fetching credits:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchCredits()
    }, [filter])

    const getStatusColor = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'activo': return 'bg-green-100 text-green-700 border-green-200'
            case 'vencido': return 'bg-orange-100 text-orange-700 border-orange-200'
            case 'pagado': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'cancelado': return 'bg-neutral-100 text-neutral-700 border-neutral-200'
            default: return 'bg-neutral-100 text-neutral-600 border-neutral-200'
        }
    }

    const getStatusLabel = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'activo': return 'Aprobado'
            case 'vencido': return 'Pendiente'
            case 'pagado': return 'Pagado'
            case 'cancelado': return 'Rechazado'
            default: return estado
        }
    }

    // Totales calculados
    const totalCartera = credits.reduce((sum, c) => sum + Number(c.monto_aprobado), 0)
    const totalSaldo = credits.reduce((sum, c) => sum + Number(c.saldo), 0)
    const totalPagado = credits.reduce((sum, c) => sum + Number(c.total_pagado), 0)

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <PageHero
                title="Gestión de Crédito"
                subtitle="Monitorea el estado crediticio y límites de tu cartera"
                chips={[
                    { label: 'Finanzas', variant: 'blue' },
                    { label: 'Control de Riesgo', variant: 'red' },
                ]}
            />

            {/* Resumen de Crédito */}
            <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-red-50 p-3">
                            <CreditCard className="h-6 w-6 text-brand-red" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-600">Cupo Total Cartera</p>
                            <p className="text-2xl font-bold text-neutral-950">${totalCartera.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-50 p-3">
                            <TrendingUp className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-600">Saldo Pendiente</p>
                            <p className="text-2xl font-bold text-neutral-950">${totalSaldo.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-50 p-3">
                            <History className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-600">Total Pagado</p>
                            <p className="text-2xl font-bold text-neutral-950">${totalPagado.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filtros */}
            <section className="flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500 mr-2 border-r pr-4">
                    <Filter className="h-4 w-4" />
                    <span>Filtrar por estado:</span>
                </div>
                {(['TODOS', 'APROBADO', 'PENDIENTES', 'PAGADOS', 'RECHAZADOS'] as FilterType[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${filter === t
                            ? 'bg-brand-red text-white shadow-md ring-2 ring-brand-red/20'
                            : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </section>

            {/* Detalle por Clientes */}
            <div className="space-y-4">
                <SectionHeader
                    title="Historial de Créditos"
                    subtitle="Detalle de aprobaciones y pagos de tu cartera"
                />

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-neutral-200">
                        <Loader2 className="h-10 w-10 text-brand-red animate-spin mb-4" />
                        <p className="text-neutral-500 font-medium">Cargando créditos...</p>
                    </div>
                ) : credits.length === 0 ? (
                    <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
                        <CreditCard className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-900">No se encontraron créditos</h3>
                        <p className="text-sm text-neutral-500 max-w-sm mx-auto mt-2">
                            No hay registros que coincidan con el filtro seleccionado.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 border-b border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-500">
                                    <tr>
                                        <th className="px-6 py-4">ID Pedido</th>
                                        <th className="px-6 py-4">Fecha Venc.</th>
                                        <th className="px-6 py-4">Monto Aprob.</th>
                                        <th className="px-6 py-4">Saldo</th>
                                        <th className="px-6 py-4">Estado</th>
                                        <th className="px-6 py-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {credits.map((credit) => (
                                        <tr key={credit.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                                                        <FileText className="h-4 w-4 text-brand-red" />
                                                    </div>
                                                    <span className="font-mono font-medium text-neutral-900">{credit.pedido_id.slice(0, 8)}...</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-neutral-600">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(credit.fecha_vencimiento).toLocaleDateString('es-EC', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-neutral-900">
                                                ${Number(credit.monto_aprobado).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${Number(credit.saldo) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    ${Number(credit.saldo).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusColor(credit.estado)}`}>
                                                    {getStatusLabel(credit.estado)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleViewDetail(credit.id)}
                                                    className="text-neutral-400 hover:text-brand-red transition-colors font-bold text-xs"
                                                >
                                                    Ver detalle
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <CreditDetailModal
                isOpen={isDetailOpen}
                onClose={closeDetail}
                detail={selectedDetail}
                loading={loadingDetail}
            />
        </div>
    )
}
