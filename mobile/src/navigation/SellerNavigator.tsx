import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { TabNavigation } from '../components/ui/TabNavigation'

import { SellerHomeScreen } from '../features/vendedor/screens/ModuloInicio/SellerHomeScreen'
import { SellerProfileScreen } from '../features/vendedor/screens/ModuloPerfil/SellerProfileScreen'

const Tab = createBottomTabNavigator()

export function SellerNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <TabNavigation {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Inicio" component={SellerHomeScreen} />
            <Tab.Screen name="Perfil" component={SellerProfileScreen} />
        </Tab.Navigator>
    )
}
