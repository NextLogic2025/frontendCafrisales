import React, { useState } from 'react'
import { View } from 'react-native'
import { Header, TabBar, DEFAULT_TABS } from '@/components/ui'
import { ClienteInicioScreen } from '@/features/cliente/ModuloInicio'
import { ClientePerfilScreen } from '@/features/cliente/ModuloPerfil'

interface ClienteRouteProps {
  user: {
    id: string
    nombre: string
    email: string
    telefono?: string
    avatar?: string
  }
  onLogout: () => void
}

export function ClienteRoute({ user, onLogout }: ClienteRouteProps) {
  const [activeTab, setActiveTab] = useState('inicio')

  const handleNavigate = (screen: string) => {
    if (screen === 'Back') {
      setActiveTab('inicio')
    }
  }

  return (
    <View className="flex-1 bg-white">
      <Header
        title={activeTab === 'inicio' ? 'Panel Cliente' : 'Mi Perfil'}
        subtitle={activeTab === 'inicio' ? 'Cliente' : undefined}
      />

      <View className="flex-1">
        {activeTab === 'inicio' && (
          <ClienteInicioScreen userName={user.nombre} />
        )}
        {activeTab === 'perfil' && (
          <ClientePerfilScreen
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
