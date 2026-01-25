import React, { useState } from 'react'
import { View } from 'react-native'
import { Header, TabBar, DEFAULT_TABS } from '@/components/ui'
import { TransportistaInicioScreen } from '@/features/transportista/ModuloInicio'
import { TransportistaPerfilScreen } from '@/features/transportista/ModuloPerfil'

interface TransportistaRouteProps {
  user: {
    id: string
    nombre: string
    email: string
    telefono?: string
    avatar?: string
  }
  onLogout: () => void
}

export function TransportistaRoute({ user, onLogout }: TransportistaRouteProps) {
  const [activeTab, setActiveTab] = useState('inicio')

  const handleNavigate = (screen: string) => {
    if (screen === 'Back') {
      setActiveTab('inicio')
    }
  }

  return (
    <View className="flex-1 bg-white">
      <Header
        title={activeTab === 'inicio' ? 'Panel Transportista' : 'Mi Perfil'}
        subtitle={activeTab === 'inicio' ? 'Transportista' : undefined}
      />

      <View className="flex-1">
        {activeTab === 'inicio' && (
          <TransportistaInicioScreen userName={user.nombre} />
        )}
        {activeTab === 'perfil' && (
          <TransportistaPerfilScreen
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
