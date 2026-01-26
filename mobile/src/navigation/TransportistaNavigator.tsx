import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { TabNavigation } from '../components/ui/TabNavigation'

import { TransportistaHomeScreen } from '../features/transportista/screens/ModuloInicio/TransportistaHomeScreen'
import { TransportistaProfileScreen } from '../features/transportista/screens/ModuloPerfil/TransportistaProfileScreen'

const Tab = createBottomTabNavigator()

export function TransportistaNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <TabNavigation {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Inicio" component={TransportistaHomeScreen} />
            <Tab.Screen name="Perfil" component={TransportistaProfileScreen} />
        </Tab.Navigator>
    )
}
