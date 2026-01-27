import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ClientProductsScreen } from './ClientProductsScreen'
import { ClientProductDetailScreen } from './ClientProductDetailScreen'

const Stack = createNativeStackNavigator()

export function ClientProductNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientProducts" component={ClientProductsScreen} />
      <Stack.Screen name="ClientProductDetail" component={ClientProductDetailScreen} />
    </Stack.Navigator>
  )
}
