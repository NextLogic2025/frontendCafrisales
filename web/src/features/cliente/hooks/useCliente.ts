import { useCallback, useMemo, useState } from 'react'
import { Conversacion, Entrega, EstadoPedido, Factura, Notificacion, Pedido, PerfilCliente, Producto, SucursalCliente, Ticket } from '../types'
import { getMyOrders, cancelOrder, getOrderById } from '../../vendedor/services/pedidosApi'


type CrearPedidoDesdeCarritoOptions = any

export function useCliente() {
  const [perfil, setPerfil] = useState<PerfilCliente | null>(null)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidosTotalPaginas, setPedidosTotalPaginas] = useState(1)
  const [pedidosPaginaActual, setPedidosPaginaActual] = useState(1)
  const [productos, setProductos] = useState<Producto[]>([])
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [sucursales, setSucursales] = useState<SucursalCliente[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unreadMessageCount = useMemo(
    () => conversaciones.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0),
    [conversaciones],
  )

  const fetchPerfilCliente = useCallback(async () => {
    setCargando(false)
    setPerfil(null)
  }, [])

  const fetchPedidos = useCallback(async (pagina = 1) => {
    try {
      setCargando(true)
      const data = await getMyOrders()
      setPedidos(data as any[]) // Casting if types slightly mismatch, usually OrderResponse vs Pedido
      setPedidosPaginaActual(pagina)
      setPedidosTotalPaginas(1) // Backend returns array, not paginated object, so specific paging not available yet
    } catch (e) {
      setError('Error al cargar pedidos')
    } finally {
      setCargando(false)
    }
  }, [])

  const obtenerPedidoPorId = useCallback(async (id: string) => {
    try {
      setCargando(true)
      const data = await getOrderById(id)
      return data as any as Pedido
    } catch (e) {
      throw e
    } finally {
      setCargando(false)
    }
  }, [])

  const fetchSucursales = useCallback(async () => {
    setCargando(false)
    setSucursales([])
  }, [])

  const fetchFacturas = useCallback(async () => {
    setCargando(false)
    setFacturas([])
  }, [])

  const fetchEntregas = useCallback(async () => {
    setCargando(false)
    setEntregas([])
  }, [])

  const fetchProductos = useCallback(async (options?: { page?: number; per_page?: number; category?: string; categoryId?: number }) => {
    setCargando(false)
    setProductos([])
  }, [])

  const fetchNotificaciones = useCallback(async () => {
    setCargando(false)
    setNotificaciones([])
  }, [])

  const fetchConversaciones = useCallback(async () => {
    setCargando(false)
    setConversaciones([])
  }, [])

  const fetchTickets = useCallback(async () => {
    setCargando(false)
    setTickets([])
  }, [])

  const cancelarPedido = useCallback(async (id: string) => {
    try {
      await cancelOrder(id, 'Cancelado por el cliente')
      setPedidos(prev => prev.map(p => (p.id === id ? { ...p, status: EstadoPedido.CANCELLED, estado: 'cancelado' } : p)))
      // Success handled by UI refresh
      await fetchPedidos(pedidosPaginaActual) // Check updated data from server
    } catch (error: any) {
      alert(`Error al cancelar: ${error.message || error}`)
      setError('No se pudo cancelar el pedido')
    }
  }, [fetchPedidos, pedidosPaginaActual])

  const crearTicket = useCallback(async (nuevo: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>) => {
    // Logic removed
  }, [])

  const marcarNotificacionComoLeida = useCallback((id: string) => {
    setNotificaciones(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const marcarTodasComoLeidas = useCallback(() => {
    setNotificaciones(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const limpiarError = useCallback(() => setError(null), [])

  const crearPedidoDesdeCarrito = useCallback(
    async (options?: CrearPedidoDesdeCarritoOptions) => {
      // Logic removed
      return null
    },
    [],
  )

  return {
    perfil,
    pedidos,
    pedidosTotalPaginas,
    pedidosPaginaActual,
    productos,
    facturas,
    entregas,
    notificaciones,
    conversaciones,
    tickets,
    sucursales,
    unreadMessageCount,
    cargando,
    error,
    fetchPerfilCliente,
    fetchPedidos,
    fetchFacturas,
    fetchEntregas,
    fetchProductos,
    fetchNotificaciones,
    fetchConversaciones,
    fetchTickets,
    fetchSucursales,
    cancelarPedido,
    crearTicket,
    marcarNotificacionComoLeida,
    marcarTodasComoLeidas,
    limpiarError,
    crearPedidoDesdeCarrito,
    obtenerPedidoPorId,
  }
}
