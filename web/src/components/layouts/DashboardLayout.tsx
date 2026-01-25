import React from 'react'
import {
  Sidebar,
  SidebarItem,
  SidebarSection,
  Header,
  HeaderLeft,
  HeaderRight,
  UserMenu,
  Container,
} from '../ui/layout'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  MapPin,
  CreditCard,
  Settings,
  FileText,
  Truck,
  BarChart3
} from 'lucide-react'
import { cn } from '@/utils'

export interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    name: string
    email: string
    avatar?: string
    role: string
  }
  currentPath?: string
  onLogout?: () => void
  onProfile?: () => void
  onSettings?: () => void
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  user,
  currentPath = '',
  onLogout,
  onProfile,
  onSettings,
}) => {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        logo={
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-red flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-lg text-neutral-900">Cafrisales</span>
          </div>
        }
      >
        {/* Main Navigation */}
        <SidebarSection collapsed={collapsed}>
          <SidebarItem
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Dashboard"
            active={currentPath === '/dashboard'}
            collapsed={collapsed}
            href="/dashboard"
          />
          <SidebarItem
            icon={<ShoppingCart className="h-5 w-5" />}
            label="Pedidos"
            active={currentPath === '/orders'}
            collapsed={collapsed}
            href="/orders"
            badge={5}
          />
          <SidebarItem
            icon={<Package className="h-5 w-5" />}
            label="Catálogo"
            active={currentPath === '/catalog'}
            collapsed={collapsed}
            href="/catalog"
          />
          <SidebarItem
            icon={<Users className="h-5 w-5" />}
            label="Clientes"
            active={currentPath === '/clients'}
            collapsed={collapsed}
            href="/clients"
          />
          <SidebarItem
            icon={<Truck className="h-5 w-5" />}
            label="Rutas"
            active={currentPath === '/routes'}
            collapsed={collapsed}
            href="/routes"
          />
        </SidebarSection>

        {/* Management Section */}
        <SidebarSection title="Gestión" collapsed={collapsed}>
          <SidebarItem
            icon={<CreditCard className="h-5 w-5" />}
            label="Crédito"
            active={currentPath === '/credit'}
            collapsed={collapsed}
            href="/credit"
          />
          <SidebarItem
            icon={<MapPin className="h-5 w-5" />}
            label="Zonas"
            active={currentPath === '/zones'}
            collapsed={collapsed}
            href="/zones"
          />
          <SidebarItem
            icon={<BarChart3 className="h-5 w-5" />}
            label="Reportes"
            active={currentPath === '/reports'}
            collapsed={collapsed}
            href="/reports"
          />
        </SidebarSection>

        {/* Settings Section */}
        <SidebarSection title="Sistema" collapsed={collapsed}>
          <SidebarItem
            icon={<Settings className="h-5 w-5" />}
            label="Configuración"
            active={currentPath === '/settings'}
            collapsed={collapsed}
            href="/settings"
          />
          <SidebarItem
            icon={<FileText className="h-5 w-5" />}
            label="Ayuda"
            active={currentPath === '/help'}
            collapsed={collapsed}
            href="/help"
          />
        </SidebarSection>
      </Sidebar>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header>
          <HeaderLeft>
            <h2 className="text-lg font-semibold text-white">Cafrisales Admin</h2>
          </HeaderLeft>

          <HeaderRight>
            <UserMenu
              user={user}
              onLogout={onLogout}
              onProfile={onProfile}
              onSettings={onSettings}
            />
          </HeaderRight>
        </Header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Container className="py-8">{children}</Container>
        </main>
      </div>
    </div>
  )
}
