import { useCallback, useMemo, useState } from 'react'
import { Conversacion, Entrega, EstadoPedido, Factura, Notificacion, Pedido, PerfilCliente, Producto, SucursalCliente, Ticket } from '../types'


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
    setCargando(false)
    setPedidos([])
    setPedidosPaginaActual(pagina)
    setPedidosTotalPaginas(1)
  }, [])

  const obtenerPedidoPorId = useCallback(async (id: string) => {
    return null
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
    setPedidos(prev => prev.map(p => (p.id === id ? { ...p, status: EstadoPedido.CANCELLED } : p)))
  }, [])

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
