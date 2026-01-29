import { useState, useEffect } from 'react'
import { PageHero } from '../../../../components/ui/PageHero'
import { CreditCard, TrendingUp, AlertCircle, History, Filter, Loader2, Calendar, FileText } from 'lucide-react'
import { SectionHeader } from '../../../../components/ui/SectionHeader'
import { getCredits, getCreditDetail, approveCredit, rejectCredit, type CreditListItem, type CreditDetail } from '../../services/creditosApi'
import { getOrders, getOrderById, cancelOrder } from '../../services/pedidosApi'
import { CreditDetailModal } from './components/CreditDetailModal'
import { AprobarCreditoModal } from '../CrearPedido/components/AprobarCreditoModal'

type FilterType = 'TODOS' | 'SOLICITUDES' | 'APROBADO' | 'PENDIENTES' | 'PAGADOS' | 'RECHAZADOS'

const FILTER_MAPPING: Record<FilterType, string[]> = {
    'TODOS': [],
    'SOLICITUDES': [], // Handled separately
    'APROBADO': ['activo'],
    'PENDIENTES': ['vencido'],
    'PAGADOS': ['pagado'],
    'RECHAZADOS': ['cancelado'],
}

export default function VendedorCredito() {
    const [filter, setFilter] = useState<FilterType>('TODOS')
    const [credits, setCredits] = useState<CreditListItem[]>([])
    const [loading, setLoading] = useState(true)

    // Detalle de crédito
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [selectedDetail, setSelectedDetail] = useState<CreditDetail | null>(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

    // Aprobación
    const [isApproveOpen, setIsApproveOpen] = useState(false)
    const [pendingCredit, setPendingCredit] = useState<CreditListItem | null>(null)

    const handleViewDetail = async (id: string, isRequest: boolean) => {
        setIsDetailOpen(true)
        setLoadingDetail(true)
        try {
            if (isRequest) {
                // Fetch Order Detail and map to CreditDetail
                const order = await getOrderById(id) // id is orderId here
                const mockDetail: CreditDetail = {
                    credito: {
                        id: order.id, // Use order ID
                        pedido_id: order.id,
                        cliente_id: order.cliente_id || '',
                        aprobado_por_vendedor_id: '',
                        monto_aprobado: String(order.total || 0),
                        moneda: 'USD',
                        plazo_dias: 0,
                        fecha_aprobacion: '',
                        fecha_vencimiento: '',
                        estado: 'pendiente',
                        notas: null,
                        total_pagado: '0',
                        saldo: String(order.total || 0)
                    },
                    totales: {
                        total_aprobado: order.total || 0,
                        total_pagado: 0,
                        saldo: order.total || 0
                    },
                    pagos: []
                }
                setSelectedDetail(mockDetail)
            } else {
                const data = await getCreditDetail(id)
                setSelectedDetail(data)
            }
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

    const fetchCredits = async () => {
        setLoading(true)
        try {
            if (filter === 'SOLICITUDES') {
                const [orders, allCredits] = await Promise.all([
                    getOrders(),
                    getCredits() // Fetch all credits to identify which orders are already processed
                ])

                const processedOrderIds = new Set(allCredits.map(c => c.pedido_id))

                // Filter: Created by 'cliente' (implied?), 'credito', 'pendiente_validacion'
                // And explicitly exclude orders that already have a credit record
                const requests = orders.filter(o =>
                    o.estado === 'pendiente_validacion' &&
                    // @ts-ignore
                    o.metodo_pago === 'credito' &&
                    !processedOrderIds.has(o.id)
                )

                const mapped: CreditListItem[] = requests.map(r => ({
                    id: r.id, // Using Order ID as ID
                    pedido_id: r.id,
                    cliente_id: r.cliente_id || 'Unknown',
                    aprobado_por_vendedor_id: '',
                    monto_aprobado: r.total || 0,
                    moneda: 'USD',
                    plazo_dias: 0,
                    fecha_aprobacion: '',
                    fecha_vencimiento: r.creado_en || r.created_at || '', // as created date
                    estado: 'pendiente',
                    notas: null,
                    total_pagado: 0,
                    saldo: r.total || 0
                }))
                setCredits(mapped)
            } else {
                const data = await getCredits(FILTER_MAPPING[filter])
                setCredits(data)
            }
        } catch (error) {
            console.error('Error fetching credits:', error)
            setCredits([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCredits()
    }, [filter])

    const handleOpenApprove = (credit: CreditListItem) => {
        // credit.id is OrderId if from SOLICITUDES
        setPendingCredit(credit)
        setIsApproveOpen(true)
        setIsDetailOpen(false)
    }

    const handleConfirmApprove = async (plazo: number, notas: string) => {
        if (!pendingCredit) return

        try {
            await approveCredit({
                pedido_id: pendingCredit.pedido_id,
                cliente_id: pendingCredit.cliente_id,
                monto_aprobado: Number(pendingCredit.monto_aprobado),
                plazo_dias: plazo,
                notas
            })
            alert('Crédito aprobado exitosamente')
            setIsApproveOpen(false)
            setPendingCredit(null)
            fetchCredits()
        } catch (error) {
            console.error(error)
            alert('Error al aprobar el crédito')
        }
    }

    const handleReject = async (id: string) => {
        if (!confirm('¿Está seguro de rechazar este crédito?')) return

        try {
            if (filter === 'SOLICITUDES') {
                // Rejecting a request => Cancel Order
                await cancelOrder(id, 'Solicitud de crédito rechazada')
            } else {
                await rejectCredit(id)
            }
            alert('Crédito rechazado exitosamente')
            setIsDetailOpen(false)
            fetchCredits()
        } catch (error) {
            console.error(error)
            alert('Error al rechazar el crédito')
        }
    }

    const getStatusColor = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'activo': return 'bg-green-100 text-green-700 border-green-200'
            case 'vencido': return 'bg-orange-100 text-orange-700 border-orange-200'
            case 'pagado': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'cancelado': return 'bg-neutral-100 text-neutral-700 border-neutral-200'
            case 'pendiente': return 'bg-purple-100 text-purple-700 border-purple-200'
            case 'pendiente_validacion': return 'bg-purple-100 text-purple-700 border-purple-200'
            default: return 'bg-neutral-100 text-neutral-600 border-neutral-200'
        }
    }

    const getStatusLabel = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'activo': return 'Aprobado'
            case 'vencido': return 'Pendiente Pago'
            case 'pagado': return 'Pagado'
            case 'cancelado': return 'Rechazado'
            case 'pendiente': return 'Solicitud'
            case 'pendiente_validacion': return 'Solicitud'
            default: return estado
        }
    }

    // Totales calculados (excluyendo cancelados/rechazados)
    const activeCredits = credits.filter(c => c.estado !== 'cancelado' && c.estado !== 'pendiente')
    const totalCartera = activeCredits.reduce((sum, c) => sum + Number(c.monto_aprobado), 0)
    const totalSaldo = activeCredits.reduce((sum, c) => sum + Number(c.saldo), 0)
    const totalPagado = activeCredits.reduce((sum, c) => sum + Number(c.total_pagado), 0)

    return (
        <div className="space-y-6 w-full">
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
                {(['TODOS', 'SOLICITUDES', 'APROBADO', 'PENDIENTES', 'PAGADOS', 'RECHAZADOS'] as FilterType[]).map((t) => (
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
                                        <th className="px-6 py-4">
                                            {filter === 'SOLICITUDES' ? 'Fecha Solicitud' : 'Fecha Venc.'}
                                        </th>
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
                                                    {credit.fecha_vencimiento ? new Date(credit.fecha_vencimiento).toLocaleDateString('es-EC', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    }) : '-'}
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
                                                    onClick={() => handleViewDetail(credit.id, filter === 'SOLICITUDES')}
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
                onApprove={handleOpenApprove}
                onReject={handleReject}
            />

            <AprobarCreditoModal
                isOpen={isApproveOpen}
                onClose={() => setIsApproveOpen(false)}
                onConfirm={handleConfirmApprove}
            />
        </div>
    )
}
