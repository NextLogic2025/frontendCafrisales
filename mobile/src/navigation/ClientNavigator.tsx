import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TabNavigation } from '../components/ui/TabNavigation'

import { ClientHomeScreen } from '../features/cliente/screens/ModuloInicio/ClientHomeScreen'
import { ClientProfileScreen } from '../features/cliente/screens/ModuloPerfil/ClientProfileScreen'
import { ClientProductNavigator } from '../features/cliente/screens/ModuloProductos/ClientProductNavigator'
import { ClientCartScreen } from '../features/cliente/screens/ModuloCarrito/ClientCartScreen'
import { ClientOrderReviewScreen } from '../features/cliente/screens/ModuloCarrito/ClientOrderReviewScreen'
import { ClientCreditsScreen } from '../features/cliente/screens/ModuloCreditos/ClientCreditsScreen'
import { ClientCreditDetailScreen } from '../features/cliente/screens/ModuloCreditos/ClientCreditDetailScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function ClientTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <TabNavigation {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Inicio" component={ClientHomeScreen} />
      <Tab.Screen name="Productos" component={ClientProductNavigator} />
      <Tab.Screen name="Carrito" component={ClientCartScreen} />
      <Tab.Screen name="Perfil" component={ClientProfileScreen} />
    </Tab.Navigator>
  )
}

export function ClientNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClienteTabs" component={ClientTabs} />
      <Stack.Screen name="ConfirmarPedidoCliente" component={ClientOrderReviewScreen} />
      <Stack.Screen name="ClienteCreditos" component={ClientCreditsScreen} />
      <Stack.Screen name="ClienteCreditoDetalle" component={ClientCreditDetailScreen} />
    </Stack.Navigator>
  )
}
