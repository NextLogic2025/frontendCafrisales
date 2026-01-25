import React, { useState } from 'react'
import { View } from 'react-native'
import { Header, TabBar, DEFAULT_TABS } from '@/components/ui'
import { BodegueroInicioScreen } from '@/features/bodeguero/ModuloInicio'
import { BodegueroPerfilScreen } from '@/features/bodeguero/ModuloPerfil'

interface BodegueroRouteProps {
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

export function BodegueroRoute({ user, onLogout, onUpdateProfile, isProfileLoading }: BodegueroRouteProps) {
  const [activeTab, setActiveTab] = useState('inicio')
  const roleLabel = (user.rol || 'bodeguero').toUpperCase()

  const handleNavigate = (screen: string) => {
    if (screen === 'Back') {
      setActiveTab('inicio')
    }
  }

  const isHome = activeTab === 'inicio'

  return (
    <View className="flex-1 bg-white">
      <Header
        title={isHome ? 'Panel Bodeguero' : 'Mi Perfil'}
        variant={isHome ? 'welcome' : 'default'}
        greetingName={isHome ? user.nombre : undefined}
        roleLabel={roleLabel}
        avatarUri={user.avatar}
      />

      <View className="flex-1">
        {activeTab === 'inicio' && (
          <BodegueroInicioScreen userName={user.nombre} />
        )}
        {activeTab === 'perfil' && (
          <BodegueroPerfilScreen
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
