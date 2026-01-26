import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { HeaderMenu, HeaderMenuAction } from './HeaderMenu'

type Props = {
  extraActions?: HeaderMenuAction[]
}

export function SupervisorHeaderMenu({ extraActions = [] }: Props) {
  const navigation = useNavigation<any>()

  const actions: HeaderMenuAction[] = [
    { label: 'Zonas', icon: 'map-outline', onPress: () => navigation.navigate('SupervisorZones') },
    { label: 'Canales', icon: 'pricetag-outline', onPress: () => navigation.navigate('SupervisorChannels') },
  ]

  return <HeaderMenu actions={[...actions, ...extraActions]} />
}
