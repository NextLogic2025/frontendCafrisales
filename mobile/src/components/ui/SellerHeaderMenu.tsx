import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { HeaderMenu, HeaderMenuAction } from './HeaderMenu'

type Props = {
  extraActions?: HeaderMenuAction[]
}

export function SellerHeaderMenu({ extraActions = [] }: Props) {
  const navigation = useNavigation<any>()

  const navigateToTab = (tabName: string) => {
    const parent = navigation.getParent?.()
    if (parent?.getState?.().routeNames?.includes('SellerTabs')) {
      parent.navigate('SellerTabs', { screen: tabName })
      return
    }
    navigation.navigate(tabName)
  }

  const openCredits = () => {
    const parent = navigation.getParent?.()
    if (parent?.getState?.().routeNames?.includes('Creditos')) {
      parent.navigate('Creditos')
      return
    }
    navigation.navigate('Creditos')
  }

  const actions: HeaderMenuAction[] = [
    { label: 'Clientes', icon: 'people-outline', onPress: () => navigateToTab('Clientes') },
    { label: 'Productos', icon: 'cube-outline', onPress: () => navigateToTab('Productos') },
    { label: 'Carrito', icon: 'cart-outline', onPress: () => navigateToTab('Carrito') },
    { label: 'Creditos', icon: 'cash-outline', onPress: openCredits },
    { label: 'Solicitudes', icon: 'document-text-outline', onPress: () => navigation.navigate('SolicitudesCredito') },
  ]

  return <HeaderMenu actions={[...actions, ...extraActions]} />
}
