import React, { useState } from 'react'
import { View } from 'react-native'
import { Header, TabBar, DEFAULT_TABS } from '@/components/ui'
import { VendedorInicioScreen } from '@/features/vendedor/ModuloInicio'
import { VendedorPerfilScreen } from '@/features/vendedor/ModuloPerfil'

interface VendedorRouteProps {
  user: {
    id: string
    nombre: string
    email: string
    telefono?: string
    avatar?: string
    rol?: string
  }
  onLogout: () => void
  onUpdateProfile?: (data: { nombres?: string; apellidos?: string; telefono?: string }) => Promise<boolean>
  isProfileLoading?: boolean
}

export function VendedorRoute({ user, onLogout, onUpdateProfile, isProfileLoading }: VendedorRouteProps) {
  const [activeTab, setActiveTab] = useState('inicio')
  const roleLabel = (user.rol || 'vendedor').toUpperCase()

  const handleNavigate = (screen: string) => {
    if (screen === 'Back') {
      setActiveTab('inicio')
    }
  }

  const isHome = activeTab === 'inicio'

  return (
    <View className="flex-1 bg-white">
      <Header
        title={isHome ? 'Panel Vendedor' : 'Mi Perfil'}
        variant={isHome ? 'welcome' : 'default'}
        greetingName={isHome ? user.nombre : undefined}
        roleLabel={roleLabel}
        avatarUri={user.avatar}
      />

      <View className="flex-1">
        {activeTab === 'inicio' && (
          <VendedorInicioScreen userName={user.nombre} />
        )}
        {activeTab === 'perfil' && (
          <VendedorPerfilScreen
            user={user}
            onLogout={onLogout}
            onNavigate={handleNavigate}
            onUpdateProfile={onUpdateProfile}
            isLoading={isProfileLoading}
          />
        )}
      </View>

      <TabBar
        tabs={DEFAULT_TABS}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
    </View>
  )
}
