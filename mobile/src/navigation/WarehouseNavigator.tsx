import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { TabNavigation } from '../components/ui/TabNavigation'

import { WarehouseHomeScreen } from '../features/bodeguero/screens/ModuloInicio/WarehouseHomeScreen'
import { WarehouseProfileScreen } from '../features/bodeguero/screens/ModuloPerfil/WarehouseProfileScreen'

const Tab = createBottomTabNavigator()

export function WarehouseNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <TabNavigation {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Inicio" component={WarehouseHomeScreen} />
            <Tab.Screen name="Perfil" component={WarehouseProfileScreen} />
        </Tab.Navigator>
    )
}
