import * as React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { SplashPage } from '../pages/SplashPage'
import BodegueroLayout from '../features/bodeguero/BodegueroPage'
import {
  DashboardPage,
  PedidosPage,
  PerfilPage,
} from '../features/bodeguero/pages'

const NotificacionesBodegaPage = React.lazy(() => import('../features/bodeguero/pages/Notificaciones'))

import { RequireAuth } from './RequireAuth'

import ClienteLayout from '../features/cliente/ClientePage'
const PaginaPanelCliente = React.lazy(() => import('../features/cliente/pages/dashboard'))
const PaginaPedidos = React.lazy(() => import('../features/cliente/pages/pedidos'))
const PaginaProductos = React.lazy(() => import('../features/cliente/pages/productos'))
const PaginaCarrito = React.lazy(() => import('../features/cliente/pages/carrito'))
const PaginaEntregas = React.lazy(() => import('../features/cliente/pages/entregas'))
const PaginaNotificaciones = React.lazy(() => import('../features/cliente/pages/notificaciones'))
const PaginaPerfilCliente = React.lazy(() => import('../features/cliente/pages/perfil'))
const SupervisorLayout = React.lazy(() => import('../features/supervisor/SupervisorPage'))
const VendedorLayout = React.lazy(() => import('../features/vendedor/VendedorPage'))
const VendedorDashboard = React.lazy(() => import('../features/vendedor/pages/Dashboard'))
const VendedorClientes = React.lazy(() => import('../features/vendedor/pages/Clientes'))
const VendedorRutas = React.lazy(() => import('../features/vendedor/pages/Rutas'))
const VendedorDetalleRuta = React.lazy(() => import('../features/vendedor/pages/Rutas/DetalleRutaPage'))
const VendedorProductos = React.lazy(() => import('../features/vendedor/pages/Productos'))
const VendedorCrearPedido = React.lazy(() => import('../features/vendedor/pages/CrearPedido'))
const VendedorPedidos = React.lazy(() => import('../features/vendedor/pages/Pedidos'))
const VendedorNotificaciones = React.lazy(() => import('../features/vendedor/pages/Notificaciones'))
const VendedorCredito = React.lazy(() => import('../features/vendedor/pages/Credito/credito'))
const VendedorPerfil = React.lazy(() => import('../features/vendedor/pages/Perfil'))
const TransportistaPage = React.lazy(() => import('../features/transportista/TransportistaPage'))
const TransportistaInicio = React.lazy(() => import('../features/transportista/pages/Inicio'))
const TransportistaRutas = React.lazy(() => import('../features/transportista/pages/Rutas'))
const TransportistaDetalleRutero = React.lazy(() => import('../features/transportista/pages/Rutas/DetalleRuteroPage'))
const TransportistaNotificaciones = React.lazy(() => import('../features/transportista/pages/Notificaciones'))
const TransportistaPerfil = React.lazy(() => import('../features/transportista/pages/Perfil'))

const SupervisorDashboard = React.lazy(() => import('../features/supervisor/pages/Dashboard'))
const SupervisorClientes = React.lazy(() => import('../features/supervisor/pages/Clientes'))
const SupervisorConductores = React.lazy(() => import('../features/supervisor/pages/vehiculos/vehiculos'))
const SupervisorEquipo = React.lazy(() => import('../features/supervisor/pages/Equipo'))
const SupervisorCatalogo = React.lazy(() => import('../features/supervisor/pages/Catalogo'))
const SupervisorZonas = React.lazy(() => import('../features/supervisor/pages/Zonas'))
const SupervisorRutas = React.lazy(() => import('../features/supervisor/pages/Rutas/index'))
const SupervisorPedidos = React.lazy(() => import('../features/supervisor/pages/Pedidos'))
const SupervisorEntregas = React.lazy(() => import('../features/supervisor/pages/Entregas'))
const SupervisorNotificaciones = React.lazy(() => import('../features/supervisor/pages/Notificaciones')) // User created this file
const SupervisorPerfil = React.lazy(() => import('../features/supervisor/pages/Perfil'))
const SupervisorPromociones = React.lazy(() => import('../features/supervisor/pages/Pedidos/PromocionesSupervisor'))
const SupervisorRuterosLogisticos = React.lazy(() => import('../features/supervisor/pages/RuterosLogisticos'))

export default function AppRouter() {
  return (
    <React.Suspense fallback={<SplashPage />}>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/app/*" element={<Navigate to="/login" replace />} />

        <Route
          path="/cliente/*"
          element={
            <RequireAuth allowedRoles={['cliente']}>
              <ClienteLayout />
            </RequireAuth>
          }
        >
          <Route index element={<PaginaPanelCliente />} />
          <Route path="pedidos" element={<PaginaPedidos />} />
          <Route path="productos" element={<PaginaProductos />} />
          <Route path="carrito" element={<PaginaCarrito />} />
          <Route path="entregas" element={<PaginaEntregas />} />
          <Route path="notificaciones" element={<PaginaNotificaciones />} />
          <Route path="perfil" element={<PaginaPerfilCliente />} />
        </Route>

        <Route path="/app/cliente/*" element={<Navigate to="/cliente" replace />} />

        <Route path="/app/bodeguero/*" element={<Navigate to="/bodeguero" replace />} />

        <Route
          path="/bodeguero/*"
          element={
            <RequireAuth allowedRoles={['bodeguero']}>
              <BodegueroLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="pedidos" element={<PedidosPage />} />


          <Route path="notificaciones" element={<NotificacionesBodegaPage />} />
          <Route path="perfil" element={<PerfilPage />} />
        </Route>

        <Route path="/app/vendedor/*" element={<Navigate to="/vendedor" replace />} />

        <Route
          path="/vendedor/*"
          element={
            <RequireAuth allowedRoles={['vendedor']}>
              <VendedorLayout />
            </RequireAuth>
          }
        >
          <Route index element={<VendedorDashboard />} />
          <Route path="clientes" element={<VendedorClientes />} />
          <Route path="rutas">
            <Route index element={<VendedorRutas />} />
            <Route path=":id" element={<VendedorDetalleRuta />} />
          </Route>
          <Route path="productos" element={<VendedorProductos />} />
          <Route path="crear-pedido" element={<VendedorCrearPedido />} />
          <Route path="pedidos" element={<VendedorPedidos />} />
          <Route path="notificaciones" element={<VendedorNotificaciones />} />
          <Route path="credito" element={<VendedorCredito />} />
          <Route path="perfil" element={<VendedorPerfil />} />
        </Route>

        <Route path="/app/transportista/*" element={<Navigate to="/transportista" replace />} />

        <Route
          path="/transportista/*"
          element={
            <RequireAuth allowedRoles={['transportista']}>
              <TransportistaPage />
            </RequireAuth>
          }
        >
          <Route index element={<TransportistaInicio />} />
          <Route path="rutas">
            <Route index element={<TransportistaRutas />} />
            <Route path=":id" element={<TransportistaDetalleRutero />} />
          </Route>
          <Route path="notificaciones" element={<TransportistaNotificaciones />} />
          <Route path="perfil" element={<TransportistaPerfil />} />
        </Route>

        <Route path="/app/supervisor/*" element={<Navigate to="/supervisor" replace />} />

        <Route
          path="/supervisor/*"
          element={
            <RequireAuth allowedRoles={['supervisor']}>
              <SupervisorLayout />
            </RequireAuth>
          }
        >
          <Route index element={<SupervisorDashboard />} />
          <Route path="clientes" element={<SupervisorClientes />} />
          <Route path="vehiculos" element={<SupervisorConductores />} />
          <Route path="equipo" element={<SupervisorEquipo />} />
          <Route path="catalogo" element={<SupervisorCatalogo />} />
          <Route path="zonas" element={<SupervisorZonas />} />
          <Route path="rutas" element={<SupervisorRutas />} />
          <Route path="pedidos" element={<SupervisorPedidos />} />
          <Route path="promociones" element={<SupervisorPromociones />} />
          <Route path="ruteros-logisticos" element={<SupervisorRuterosLogisticos />} />
          <Route path="entregas" element={<SupervisorEntregas />} />
          <Route path="notificaciones" element={<SupervisorNotificaciones />} />
          <Route path="perfil" element={<SupervisorPerfil />} />
        </Route>

        <Route path="/app/*" element={<Navigate to="/login" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  )
}
