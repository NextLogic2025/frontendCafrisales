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
  }
  onLogout: () => void
}

export function VendedorRoute({ user, onLogout }: VendedorRouteProps) {
  const [activeTab, setActiveTab] = useState('inicio')

  const handleNavigate = (screen: string) => {
    if (screen === 'Back') {
      setActiveTab('inicio')
    }
  }

  return (
    <View className="flex-1 bg-white">
      <Header
        title={activeTab === 'inicio' ? 'Panel Vendedor' : 'Mi Perfil'}
        subtitle={activeTab === 'inicio' ? 'Vendedor' : undefined}
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
