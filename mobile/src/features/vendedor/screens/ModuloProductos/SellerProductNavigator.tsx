import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SellerProductsScreen } from './SellerProductsScreen'
import { ClientProductDetailScreen } from '../../../cliente/screens/ModuloProductos/ClientProductDetailScreen'

const Stack = createNativeStackNavigator()

export function SellerProductNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SellerProducts" component={SellerProductsScreen} />
      <Stack.Screen name="SellerProductDetail" component={ClientProductDetailScreen} />
    </Stack.Navigator>
  )
}
