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
  }
  onLogout: () => void
}

export function BodegueroRoute({ user, onLogout }: BodegueroRouteProps) {
  const [activeTab, setActiveTab] = useState('inicio')

  const handleNavigate = (screen: string) => {
    if (screen === 'Back') {
      setActiveTab('inicio')
    }
  }

  return (
    <View className="flex-1 bg-white">
      <Header
        title={activeTab === 'inicio' ? 'Panel Bodeguero' : 'Mi Perfil'}
        subtitle={activeTab === 'inicio' ? 'Bodeguero' : undefined}
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
