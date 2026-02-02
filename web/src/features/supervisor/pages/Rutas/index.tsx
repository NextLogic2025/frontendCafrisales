import React, { useState, useEffect } from 'react'
import { Plus, Filter } from 'components/ui/Icons'
import { SectionHeader } from 'components/ui/SectionHeader'
import { PageHero } from 'components/ui/PageHero'
import { Button } from 'components/ui/Button'
import { Alert } from 'components/ui/Alert'
import { LoadingSpinner } from 'components/ui/LoadingSpinner'
import { FormField } from 'components/ui/FormField'
import { RutaCard } from '../../components/RutaCard'
import { CrearRutaModal } from './CrearRutaModal'
import { DetalleRutaModal } from './DetalleRutaModal'
import type { RutaVendedor, EstadoRuta, CreateRutaVendedorPayload, CancelarRutaPayload } from '../../services/rutasVendedorTypes'
import {
    getRutasVendedor,
    getRutaVendedorById,
    createRutaVendedor,
    publicarRuta,
    cancelarRuta,
} from '../../services/rutasVendedorApi'
import { obtenerVendedores, type Vendedor } from '../../services/usuariosApi'
import { obtenerZonas, type ZonaComercial } from '../../services/clientesApi'

export default function RutasPage() {
    const [rutas, setRutas] = useState<RutaVendedor[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Filters
    const [filtroEstado, setFiltroEstado] = useState<EstadoRuta | ''>('')
    const [filtroVendedor, setFiltroVendedor] = useState('')
    const [vendedores, setVendedores] = useState<Vendedor[]>([])
    const [zonas, setZonas] = useState<ZonaComercial[]>([]) // Added zones state

    // Modals
    const [isCrearModalOpen, setIsCrearModalOpen] = useState(false)
    const [detalleRuta, setDetalleRuta] = useState<RutaVendedor | null>(null)

    useEffect(() => {
        loadData()
    }, [filtroEstado, filtroVendedor]) // Modified dependencies

    const loadData = async () => {
        setIsLoading(true) // Added
        try {
            const [vendedoresData, zonasData] = await Promise.all([ // Modified to fetch in parallel
                obtenerVendedores(),
                obtenerZonas(), // Added call to obtenerZonas
            ])
            setVendedores(vendedoresData)
            setZonas(zonasData) // Set zones state

            await loadRutas(vendedoresData, zonasData) // Pass data to loadRutas
        } catch (error) {
        } finally { // Added finally block
            setIsLoading(false)
        }
    }

    const loadRutas = async (vendedoresList: Vendedor[], zonasList: ZonaComercial[]) => { // Modified to accept lists
        try {
            const filtros: any = {}
            if (filtroEstado) filtros.estado = filtroEstado
            if (filtroVendedor) filtros.vendedor_id = filtroVendedor

            const data = await getRutasVendedor(filtros)

            // Load full details for each route to get paradas
            const rutasConDetalles = await Promise.all(
                data.map(async (r) => {
                    try {
                        // Get full route details including paradas
                        const rutaCompleta = await getRutaVendedorById(r.id)

                        const vendedor = vendedoresList.find(v => v.id === rutaCompleta.vendedor_id)
                        const zona = zonasList.find(z => String(z.id) === String(rutaCompleta.zona_id))

                        return {
                            ...rutaCompleta,
                            paradas: rutaCompleta.paradas || [],
                            vendedor: rutaCompleta.vendedor || (vendedor ? {
                                id: vendedor.id,
                                nombre: vendedor.nombre,
                                email: ''
                            } : undefined),
                            zona: rutaCompleta.zona || (zona ? {
                                id: zona.id,
                                nombre: zona.nombre,
                            } : undefined),
                        }
                    } catch (error) {
                        // If individual route fetch fails, return basic data
                        // If individual route fetch fails, return basic data
                        const vendedor = vendedoresList.find(v => v.id === r.vendedor_id)
                        const zona = zonasList.find(z => String(z.id) === String(r.zona_id))

                        return {
                            ...r,
                            paradas: r.paradas || [],
                            vendedor: r.vendedor || (vendedor ? {
                                id: vendedor.id,
                                nombre: vendedor.nombre,
                                email: ''
                            } : undefined),
                            zona: r.zona || (zona ? {
                                id: zona.id,
                                nombre: zona.nombre,
                            } : undefined),
                        }
                    }
                })
            )

            setRutas(rutasConDetalles)
        } catch (error) {
            showToast('error', 'Error al cargar rutas')
        }
    }

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message })
        setTimeout(() => setToast(null), 3000)
    }

    const handleCrearRuta = async (payload: CreateRutaVendedorPayload) => {
        try {
            await createRutaVendedor(payload)
            showToast('success', 'Ruta creada exitosamente')
            loadRutas(vendedores, zonas)
        } catch (error: any) {
            throw error
        }
    }

    const handlePublicar = async (ruta: RutaVendedor) => {
        if (!confirm('¿Publicar esta ruta? El vendedor podrá verla y ejecutarla.')) return

        try {
            await publicarRuta(ruta.id)
            showToast('success', 'Ruta publicada exitosamente')
            loadRutas(vendedores, zonas)
        } catch (error: any) {
            showToast('error', error.message || 'Error al publicar ruta')
        }
    }

    const handleCancelar = async (ruta: RutaVendedor) => {
        const motivo = prompt('Motivo de cancelación:')
        if (!motivo) return

        try {
            const payload: CancelarRutaPayload = { motivo }
            await cancelarRuta(ruta.id, payload)
            showToast('success', 'Ruta cancelada exitosamente')
            loadRutas(vendedores, zonas)
        } catch (error: any) {
            showToast('error', error.message || 'Error al cancelar ruta')
        }
    }

    const handleVerDetalle = async (ruta: RutaVendedor) => {
        try {
            // Fetch full route details including paradas with cliente data
            const rutaCompleta = await getRutaVendedorById(ruta.id)
            setDetalleRuta(rutaCompleta)
        } catch (error) {
            showToast('error', 'Error al cargar detalles de la ruta')
            // Fallback to the current ruta data
            setDetalleRuta(ruta)
        }
    }

    return (
        <div className="space-y-6">
            <PageHero
                title="Rutas de Vendedor"
                subtitle="Gestiona las rutas de visita de los vendedores a clientes"
                chips={['Planificación', 'Asignación', 'Seguimiento']}
            />

            {toast && (
                <Alert
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            <SectionHeader
                title="Rutas"
                subtitle="Crea y gestiona rutas de vendedor"
            />

            {/* Filters and Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        label="Filtrar por Estado"
                        type="select"
                        value={filtroEstado}
                        onChange={(val) => setFiltroEstado(val as EstadoRuta | '')}
                        options={[
                            { label: 'Todos los estados', value: '' },
                            { label: 'Borrador', value: 'borrador' },
                            { label: 'Publicado', value: 'publicado' },
                            { label: 'En Curso', value: 'en_curso' },
                            { label: 'Completado', value: 'completado' },
                            { label: 'Cancelado', value: 'cancelado' },
                        ]}
                    />

                    <FormField
                        label="Filtrar por Vendedor"
                        type="select"
                        value={filtroVendedor}
                        onChange={setFiltroVendedor}
                        options={[
                            { label: 'Todos los vendedores', value: '' },
                            ...vendedores.map(v => ({
                                label: v.nombre,
                                value: v.id,
                            })),
                        ]}
                    />
                </div>

                <Button
                    onClick={() => setIsCrearModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-red text-white hover:bg-brand-red/90 shadow-lg"
                >
                    <Plus className="h-4 w-4" />
                    Crear Ruta
                </Button>
            </div>

            {/* Rutas List */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner />
                </div>
            ) : rutas.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-300">
                    <p className="text-neutral-600 text-lg">No hay rutas disponibles</p>
                    <p className="text-neutral-500 text-sm mt-2">
                        Crea una nueva ruta para comenzar
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rutas.map(ruta => (
                        <RutaCard
                            key={ruta.id}
                            ruta={ruta}
                            role="supervisor"
                            onView={handleVerDetalle}
                            onPublish={handlePublicar}
                            onCancel={handleCancelar}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <CrearRutaModal
                isOpen={isCrearModalOpen}
                onClose={() => setIsCrearModalOpen(false)}
                onSubmit={handleCrearRuta}
            />

            <DetalleRutaModal
                isOpen={!!detalleRuta}
                onClose={() => setDetalleRuta(null)}
                ruta={detalleRuta}
            />
        </div>
    )
}
