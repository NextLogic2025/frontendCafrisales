import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SellerClientsScreen } from './SellerClientsScreen'
import { SellerClientDetailScreen } from './SellerClientDetailScreen'

const Stack = createNativeStackNavigator()

export function SellerClientsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SellerClients" component={SellerClientsScreen} />
      <Stack.Screen name="SellerClientDetail" component={SellerClientDetailScreen} />
    </Stack.Navigator>
  )
}
