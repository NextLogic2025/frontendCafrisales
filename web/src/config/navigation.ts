import {
  Home, Package, Boxes, ClipboardList, ListChecks, Truck, RotateCcw,
  BarChart3, User, Bell, CreditCard, LifeBuoy, ShoppingCart,
  Percent, MessageCircle, Users, FileText, Map, Calendar, BookOpen, Route, Archive
} from 'lucide-react'
import type { SidebarItem } from '../components/ui/SidebarNav'

// ========================================
// CLIENTE
// ========================================
export const CLIENTE_NAV_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: 'Inicio', to: '/cliente', icon: Home, end: true },
  { id: 'productos', label: 'Productos', to: '/cliente/productos', icon: Boxes },
  { id: 'carrito', label: 'Carrito', to: '/cliente/carrito', icon: ShoppingCart },
  { id: 'pedidos', label: 'Mis Pedidos', to: '/cliente/pedidos', icon: ClipboardList },
  { id: 'entregas', label: 'Entregas', to: '/cliente/entregas', icon: Truck },
  { id: 'notificaciones', label: 'Notificaciones', to: '/cliente/notificaciones', icon: Bell },
  { id: 'perfil', label: 'Mi Perfil', to: '/cliente/perfil', icon: User },
]

// ========================================
// BODEGUERO
// ========================================
export const BODEGUERO_NAV_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: 'Inicio', to: '/bodeguero', icon: Home, end: true },
  { id: 'pedidos', label: 'Pedidos', to: '/bodeguero/pedidos', icon: ClipboardList },
  { id: 'preparacion', label: 'Preparación', to: '/bodeguero/preparacion', icon: Package },
  { id: 'notificaciones', label: 'Notificaciones', to: '/bodeguero/notificaciones', icon: Bell },
  { id: 'perfil', label: 'Mi Perfil', to: '/bodeguero/perfil', icon: User },
]

// ========================================
// SUPERVISOR
// ========================================
export const SUPERVISOR_NAV_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: 'Inicio', to: '/supervisor', icon: Home, end: true },
  { id: 'clientes', label: 'Clientes', to: '/supervisor/clientes', icon: Users },
  { id: 'vehiculos', label: 'Vehículos', to: '/supervisor/vehiculos', icon: Truck },
  { id: 'equipo', label: 'Equipo', to: '/supervisor/equipo', icon: Users },
  { id: 'catalogo', label: 'Catálogo', to: '/supervisor/catalogo', icon: BookOpen },
  { id: 'zonas', label: 'Zonas', to: '/supervisor/zonas', icon: Map },
  { id: 'rutas', label: 'Rutas Comercial', to: '/supervisor/rutas', icon: Route },
  { id: 'ruteros-logisticos', label: 'Ruteros Logísticos', to: '/supervisor/ruteros-logisticos', icon: Truck },
  { id: 'pedidos', label: 'Pedidos', to: '/supervisor/pedidos', icon: ClipboardList },
  { id: 'aprobacion-promociones', label: 'Aprobación Promociones', to: '/supervisor/promociones', icon: ListChecks },
  { id: 'entregas', label: 'Entregas', to: '/supervisor/entregas', icon: Truck },
  { id: 'notificaciones', label: 'Notificaciones', to: '/supervisor/notificaciones', icon: Bell },
  { id: 'perfil', label: 'Mi Perfil', to: '/supervisor/perfil', icon: User },
]

// ========================================
// VENDEDOR
// ========================================
export const VENDEDOR_NAV_ITEMS: SidebarItem[] = [
  { id: 'dashboard', label: 'Inicio', to: '/vendedor', icon: Home, end: true },
  { id: 'clientes', label: 'Clientes', to: '/vendedor/clientes', icon: Users },
  { id: 'rutas', label: 'Rutas', to: '/vendedor/rutas', icon: Route },
  { id: 'productos', label: 'Productos', to: '/vendedor/productos', icon: Boxes },
  { id: 'crear-pedido', label: 'Crear Pedido', to: '/vendedor/crear-pedido', icon: ShoppingCart },
  { id: 'pedidos', label: 'Pedidos', to: '/vendedor/pedidos', icon: ClipboardList },
  { id: 'credito', label: 'Crédito', to: '/vendedor/credito', icon: CreditCard },
  { id: 'notificaciones', label: 'Notificaciones', to: '/vendedor/notificaciones', icon: Bell },
  { id: 'perfil', label: 'Mi Perfil', to: '/vendedor/perfil', icon: User },
]

// ========================================
// TRANSPORTISTA
// ========================================
export const TRANSPORTISTA_NAV_ITEMS: SidebarItem[] = [
  { id: 'inicio', label: 'Inicio', to: '/transportista', icon: Home, end: true },
  { id: 'rutas', label: 'Rutas', to: '/transportista/rutas', icon: Map },
  { id: 'notificaciones', label: 'Notificaciones', to: '/transportista/notificaciones', icon: Bell },
  { id: 'perfil', label: 'Mi Perfil', to: '/transportista/perfil', icon: User },
]
