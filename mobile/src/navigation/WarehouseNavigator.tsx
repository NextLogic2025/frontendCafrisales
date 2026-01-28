import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TabNavigation } from '../components/ui/TabNavigation'

import { WarehouseHomeScreen } from '../features/bodeguero/screens/ModuloInicio/WarehouseHomeScreen'
import { WarehouseProfileScreen } from '../features/bodeguero/screens/ModuloPerfil/WarehouseProfileScreen'
import { WarehouseOrdersScreen } from '../features/bodeguero/screens/ModuloPedidos/WarehouseOrdersScreen'
import { WarehouseOrderDetailScreen } from '../features/bodeguero/screens/ModuloPedidos/WarehouseOrderDetailScreen'
import { WarehouseValidateOrderScreen } from '../features/bodeguero/screens/ModuloValidaciones/WarehouseValidateOrderScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function WarehouseTabs() {
    return (
        <Tab.Navigator
            tabBar={(props) => <TabNavigation {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Inicio" component={WarehouseHomeScreen} />
            <Tab.Screen name="Pedidos" component={WarehouseOrdersScreen} />
            <Tab.Screen name="Perfil" component={WarehouseProfileScreen} />
        </Tab.Navigator>
    )
}

export function WarehouseNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WarehouseTabs" component={WarehouseTabs} />
            <Stack.Screen name="WarehousePedidoDetalle" component={WarehouseOrderDetailScreen} />
            <Stack.Screen name="WarehouseValidarPedido" component={WarehouseValidateOrderScreen} />
        </Stack.Navigator>
    )
}
