import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { TabNavigation } from '../components/ui/TabNavigation'

import { ClientHomeScreen } from '../features/cliente/screens/ModuloInicio/ClientHomeScreen'
import { ClientProfileScreen } from '../features/cliente/screens/ModuloPerfil/ClientProfileScreen'

const Tab = createBottomTabNavigator()

export function ClientNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <TabNavigation {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Inicio" component={ClientHomeScreen} />
            <Tab.Screen name="Perfil" component={ClientProfileScreen} />
        </Tab.Navigator>
    )
}
