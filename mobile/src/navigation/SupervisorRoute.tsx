import React, { useState } from 'react'
import { View } from 'react-native'
import { Header, TabBar, DEFAULT_TABS } from '@/components/ui'
import { SupervisorInicioScreen } from '@/features/supervisor/ModuloInicio'
import { SupervisorPerfilScreen } from '@/features/supervisor/ModuloPerfil'

interface SupervisorRouteProps {
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

export function SupervisorRoute({ user, onLogout, onUpdateProfile, isProfileLoading }: SupervisorRouteProps) {
  const [activeTab, setActiveTab] = useState('inicio')
  const roleLabel = (user.rol || 'supervisor').toUpperCase()

  const handleNavigate = (screen: string) => {
    if (screen === 'Back') {
      setActiveTab('inicio')
    }
  }

  const isHome = activeTab === 'inicio'

  return (
    <View className="flex-1 bg-white">
      <Header
        title={isHome ? 'Panel Supervisor' : 'Mi Perfil'}
        variant={isHome ? 'welcome' : 'default'}
        greetingName={isHome ? user.nombre : undefined}
        roleLabel={roleLabel}
        avatarUri={user.avatar}
      />

      <View className="flex-1">
        {activeTab === 'inicio' && (
          <SupervisorInicioScreen userName={user.nombre} />
        )}
        {activeTab === 'perfil' && (
          <SupervisorPerfilScreen
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
