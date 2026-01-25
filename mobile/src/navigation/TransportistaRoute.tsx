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
    rol?: string
  }
  onLogout: () => void
  onUpdateProfile?: (data: { nombres?: string; apellidos?: string; telefono?: string }) => Promise<boolean>
  isProfileLoading?: boolean
}

export function TransportistaRoute({ user, onLogout, onUpdateProfile, isProfileLoading }: TransportistaRouteProps) {
  const [activeTab, setActiveTab] = useState('inicio')
  const roleLabel = (user.rol || 'transportista').toUpperCase()

  const handleNavigate = (screen: string) => {
    if (screen === 'Back') {
      setActiveTab('inicio')
    }
  }

  const isHome = activeTab === 'inicio'

  return (
    <View className="flex-1 bg-white">
      <Header
        title={isHome ? 'Panel Transportista' : 'Mi Perfil'}
        variant={isHome ? 'welcome' : 'default'}
        greetingName={isHome ? user.nombre : undefined}
        roleLabel={roleLabel}
        avatarUri={user.avatar}
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
