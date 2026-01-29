import React, { useState, useEffect } from 'react'
import { Plus, Filter } from 'lucide-react'
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
    createRutaVendedor,
    publicarRuta,
    cancelarRuta,
} from '../../services/rutasVendedorApi'
import { obtenerVendedores, type Vendedor } from '../../services/usuariosApi'

export default function RutasPage() {
    const [rutas, setRutas] = useState<RutaVendedor[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Filters
    const [filtroEstado, setFiltroEstado] = useState<EstadoRuta | ''>('')
    const [filtroVendedor, setFiltroVendedor] = useState('')
    const [vendedores, setVendedores] = useState<Vendedor[]>([])

    // Modals
    const [isCrearModalOpen, setIsCrearModalOpen] = useState(false)
    const [detalleRuta, setDetalleRuta] = useState<RutaVendedor | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        loadRutas()
    }, [filtroEstado, filtroVendedor])

    const loadData = async () => {
        try {
            const vendedoresData = await obtenerVendedores()
            setVendedores(vendedoresData)
            await loadRutas()
        } catch (error) {
            console.error('Error loading data:', error)
            showToast('error', 'Error al cargar datos')
        }
    }

    const loadRutas = async () => {
        setIsLoading(true)
        try {
            const filtros: any = {}
            if (filtroEstado) filtros.estado = filtroEstado
            if (filtroVendedor) filtros.vendedor_id = filtroVendedor

            const data = await getRutasVendedor(filtros)
            setRutas(data)
        } catch (error) {
            console.error('Error loading rutas:', error)
            showToast('error', 'Error al cargar rutas')
        } finally {
            setIsLoading(false)
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
            loadRutas()
        } catch (error: any) {
            throw error
        }
    }

    const handlePublicar = async (ruta: RutaVendedor) => {
        if (!confirm('¿Publicar esta ruta? El vendedor podrá verla y ejecutarla.')) return

        try {
            await publicarRuta(ruta.id)
            showToast('success', 'Ruta publicada exitosamente')
            loadRutas()
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
            loadRutas()
        } catch (error: any) {
            showToast('error', error.message || 'Error al cancelar ruta')
        }
    }

    const handleVerDetalle = (ruta: RutaVendedor) => {
        setDetalleRuta(ruta)
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
