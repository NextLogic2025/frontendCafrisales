import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TabNavigation } from '../components/ui/TabNavigation'

import { SupervisorDashboardScreen } from '../features/supervisor/screens/ModuloInicio/SupervisorDashboardScreen'
import { SupervisorClientsScreen } from '../features/supervisor/screens/ModuloCliente/SupervisorClientsScreen'
import { SupervisorClientDetailScreen } from '../features/supervisor/screens/ModuloCliente/SupervisorClientDetailScreen'
import { SupervisorClientFormScreen } from '../features/supervisor/screens/ModuloCliente/SupervisorClientFormScreen'
import { SupervisorChannelsScreen } from '../features/supervisor/screens/ModuloCanales/SupervisorChannelsScreen'
import { SupervisorChannelDetailScreen } from '../features/supervisor/screens/ModuloCanales/SupervisorChannelDetailScreen'
import { SupervisorChannelFormScreen } from '../features/supervisor/screens/ModuloCanales/SupervisorChannelFormScreen'
import { SupervisorTeamScreen } from '../features/supervisor/screens/ModuloMiEquipo/SupervisorTeamScreen'
import { SupervisorTeamDetailScreen } from '../features/supervisor/screens/ModuloMiEquipo/SupervisorTeamDetailScreen'
import { SupervisorProfileScreen } from '../features/supervisor/screens/ModuloPerfil/SupervisorProfileScreen'
import { SupervisorZonesScreen } from '../features/supervisor/screens/ModuloZonas/SupervisorZonesScreen'
import { SupervisorZoneDetailScreen } from '../features/supervisor/screens/ModuloZonas/SupervisorZoneDetailScreen'
import { SupervisorZonesMapScreen } from '../features/supervisor/screens/ModuloZonas/SupervisorZonesMapScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function SupervisorTabs() {
    return (
        <Tab.Navigator
            tabBar={(props) => <TabNavigation {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Inicio" component={SupervisorDashboardScreen} />
            <Tab.Screen name="Clientes" component={SupervisorClientsScreen} />
            <Tab.Screen name="Equipo" component={SupervisorTeamScreen} />
            <Tab.Screen name="Perfil" component={SupervisorProfileScreen} />
        </Tab.Navigator>
    )
}

export function SupervisorNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SupervisorTabs" component={SupervisorTabs} />
            <Stack.Screen name="SupervisorZones" component={SupervisorZonesScreen} />
            <Stack.Screen name="SupervisorZonesMap" component={SupervisorZonesMapScreen} />
            <Stack.Screen name="SupervisorChannels" component={SupervisorChannelsScreen} />
            <Stack.Screen name="SupervisorChannelDetail" component={SupervisorChannelDetailScreen} />
            <Stack.Screen name="SupervisorChannelForm" component={SupervisorChannelFormScreen} />
            <Stack.Screen name="SupervisorClientDetail" component={SupervisorClientDetailScreen} />
            <Stack.Screen name="SupervisorClientForm" component={SupervisorClientFormScreen} />
            <Stack.Screen name="SupervisorTeamDetail" component={SupervisorTeamDetailScreen} />
            <Stack.Screen name="SupervisorZoneDetail" component={SupervisorZoneDetailScreen} />
        </Stack.Navigator>
    )
}
