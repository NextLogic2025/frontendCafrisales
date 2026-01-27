import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { HeaderMenu, HeaderMenuAction } from './HeaderMenu'

type Props = {
  extraActions?: HeaderMenuAction[]
}

export function ClientHeaderMenu({ extraActions = [] }: Props) {
  const navigation = useNavigation<any>()

  const actions: HeaderMenuAction[] = [
    { label: 'Pedidos', icon: 'receipt-outline', onPress: () => navigation.navigate('ClientePedidos') },
    { label: 'Creditos', icon: 'card-outline', onPress: () => navigation.navigate('ClienteCreditos') },
  ]

  return <HeaderMenu actions={[...actions, ...extraActions]} />
}
