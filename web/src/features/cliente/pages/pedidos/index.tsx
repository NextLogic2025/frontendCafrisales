import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'

import { SkeletonTable } from 'components/ui/LoadingSpinner'
import { Alert } from 'components/ui/Alert'
import { Pagination } from 'components/ui/Pagination'
import { PageHero } from 'components/ui/PageHero'
import { COLORES_MARCA } from '../../types'

import { usePedidosPage } from './hooks/usePedidosPage'
import { OrdersHeader } from './components/OrdersHeader'
import { OrdersTable } from './components/OrdersTable'
import { OrderDetailsModal } from './components/OrderDetailsModal'
import { CancelOrderModal } from './components/CancelOrderModal'

export default function PaginaPedidos() {
	const navigate = useNavigate()
	const {
		pedidos,
		pedidosTotalPaginas,
		cargando,
		error,
		limpiarError,
		successMessage,
		setSuccessMessage,
		pedidoSeleccionado,
		setPedidoSeleccionado,
		paginaActual,
		cambiarPagina,
		cancelarPedido,
		obtenerPedidoPorId
	} = usePedidosPage()

	// State to control cancel modal
	const [pedidoACancelar, setPedidoACancelar] = useState<{ id: string, numero: string } | null>(null)

	const handleRequestCancel = (id: string, numero: string) => {
		setPedidoACancelar({ id, numero })
	}

	const handleConfirmCancel = async () => {
		if (pedidoACancelar) {
			try {
				await cancelarPedido(pedidoACancelar.id)
			} catch (err) {
				console.error('Error en handleConfirmCancel:', err)
			}
			setPedidoACancelar(null)
		}
	}

	return (
		<>
			<PageHero
				title="Mis Pedidos"
				subtitle="Consulta el estado de tus pedidos y accede a los detalles de cada uno"
				chips={[
					'Estado de pedidos',
					'Historial completo',
					'Rastreo en tiempo real',
				]}
			/>

			<div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
				{error && <Alert type="error" title="Error" message={error} onClose={limpiarError} />}

				<OrdersHeader />

				{cargando && !pedidos.length ? (
					<SkeletonTable rows={5} />
				) : pedidos.length === 0 ? (
					<div className="py-12 text-center">
						<p className="mb-4 text-gray-600">No tienes pedidos aún</p>
						<button
							onClick={() => navigate('/cliente/productos')}
							className="inline-flex items-center gap-2 rounded-lg px-6 py-2 font-semibold text-white"
							style={{ backgroundColor: COLORES_MARCA.red }}
						>
							<Plus className="h-5 w-5" />
							Crear tu primer pedido
						</button>
					</div>
				) : (
					<>
						{successMessage && (
							<div className="mb-4">
								<Alert type="success" title="Pedido creado" message={successMessage} onClose={() => setSuccessMessage(null)} />
							</div>
						)}

						<OrdersTable
							pedidos={pedidos}
							onViewDetail={setPedidoSeleccionado}
							onCancelOrder={(id) => {
								const pedido = pedidos.find(p => p.id === id)
								if (pedido) {
									handleRequestCancel(id, pedido.numero_pedido || pedido.orderNumber)
								}
							}}
						/>

						<Pagination
							currentPage={paginaActual}
							totalPages={pedidosTotalPaginas}
							onPageChange={cambiarPagina}
							color={COLORES_MARCA.red}
						/>
					</>
				)}

				{pedidoSeleccionado && (
					<OrderDetailsModal
						pedido={pedidoSeleccionado}
						onClose={() => setPedidoSeleccionado(null)}
						onCancel={() => {
							setPedidoSeleccionado(null)
							handleRequestCancel(
								pedidoSeleccionado.id,
								pedidoSeleccionado.numero_pedido || pedidoSeleccionado.orderNumber
							)
						}}
						fetchDetallePedido={obtenerPedidoPorId}
					/>
				)}

				<CancelOrderModal
					isOpen={!!pedidoACancelar}
					onClose={() => setPedidoACancelar(null)}
					onConfirm={handleConfirmCancel}
					orderNumber={pedidoACancelar?.numero || ''}
				/>
			</div>
		</>
	)
}
