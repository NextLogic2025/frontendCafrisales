import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TabNavigation } from '../components/ui/TabNavigation'

import { TransportistaHomeScreen } from '../features/transportista/screens/ModuloInicio/TransportistaHomeScreen'
import { TransportistaProfileScreen } from '../features/transportista/screens/ModuloPerfil/TransportistaProfileScreen'
import { TransportistaRoutesScreen } from '../features/transportista/screens/ModuloRutas/TransportistaRoutesScreen'
import { TransportistaRouteDetailScreen } from '../features/transportista/screens/ModuloRutas/TransportistaRouteDetailScreen'
import { TransportistaDeliveriesScreen } from '../features/transportista/screens/ModuloEntregas/TransportistaDeliveriesScreen'
import { TransportistaDeliveryDetailScreen } from '../features/transportista/screens/ModuloEntregas/TransportistaDeliveryDetailScreen'
import { NotificationsScreen } from '../features/shared/screens/NotificationsScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function TransportistaTabs() {
    return (
        <Tab.Navigator
            tabBar={(props) => <TabNavigation {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Inicio" component={TransportistaHomeScreen} />
            <Tab.Screen name="Rutas" component={TransportistaRoutesScreen} />
            <Tab.Screen name="Entregas" component={TransportistaDeliveriesScreen} />
            <Tab.Screen name="Perfil" component={TransportistaProfileScreen} />
        </Tab.Navigator>
    )
}

export function TransportistaNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="TransportistaTabs" component={TransportistaTabs} />
            <Stack.Screen name="TransportistaRutaDetalle" component={TransportistaRouteDetailScreen} />
            <Stack.Screen name="TransportistaEntregaDetalle" component={TransportistaDeliveryDetailScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </Stack.Navigator>
    )
}
