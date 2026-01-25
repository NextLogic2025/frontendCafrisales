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
  }
  onLogout: () => void
}

export function SupervisorRoute({ user, onLogout }: SupervisorRouteProps) {
  const [activeTab, setActiveTab] = useState('inicio')

  const handleNavigate = (screen: string) => {
    if (screen === 'Back') {
      setActiveTab('inicio')
    }
  }

  return (
    <View className="flex-1 bg-white">
      <Header
        title={activeTab === 'inicio' ? 'Panel Supervisor' : 'Mi Perfil'}
        subtitle={activeTab === 'inicio' ? 'Supervisor' : undefined}
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
