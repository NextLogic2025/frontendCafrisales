import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TabNavigation } from '../components/ui/TabNavigation'

import { SellerHomeScreen } from '../features/vendedor/screens/ModuloInicio/SellerHomeScreen'
import { SellerProfileScreen } from '../features/vendedor/screens/ModuloPerfil/SellerProfileScreen'
import { SellerProductNavigator } from '../features/vendedor/screens/ModuloProductos/SellerProductNavigator'
import { SellerClientsNavigator } from '../features/vendedor/screens/ModuloClientes/SellerClientsNavigator'
import { SellerCartScreen } from '../features/vendedor/screens/ModuloCarrito/SellerCartScreen'
import { SellerOrderReviewScreen } from '../features/vendedor/screens/ModuloCarrito/SellerOrderReviewScreen'
import { SellerCreditsScreen } from '../features/vendedor/screens/ModuloCreditos/SellerCreditsScreen'
import { SellerCreditDetailScreen } from '../features/vendedor/screens/ModuloCreditos/SellerCreditDetailScreen'
import { SellerCreditRequestsScreen } from '../features/vendedor/screens/ModuloCreditos/SellerCreditRequestsScreen'
import { SellerCreditRequestDetailScreen } from '../features/vendedor/screens/ModuloCreditos/SellerCreditRequestDetailScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function SellerTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <TabNavigation {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Inicio" component={SellerHomeScreen} />
      <Tab.Screen name="Clientes" component={SellerClientsNavigator} />
      <Tab.Screen name="Productos" component={SellerProductNavigator} />
      <Tab.Screen name="Carrito" component={SellerCartScreen} />
      <Tab.Screen name="Perfil" component={SellerProfileScreen} />
    </Tab.Navigator>
  )
}

export function SellerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SellerTabs" component={SellerTabs} />
      <Stack.Screen name="ConfirmarPedido" component={SellerOrderReviewScreen} />
      <Stack.Screen name="Creditos" component={SellerCreditsScreen} />
      <Stack.Screen name="CreditoDetalle" component={SellerCreditDetailScreen} />
      <Stack.Screen name="SolicitudesCredito" component={SellerCreditRequestsScreen} />
      <Stack.Screen name="SolicitudCreditoDetalle" component={SellerCreditRequestDetailScreen} />
    </Stack.Navigator>
  )
}
