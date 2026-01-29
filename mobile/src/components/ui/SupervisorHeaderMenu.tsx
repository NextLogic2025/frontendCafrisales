import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { HeaderMenu, HeaderMenuAction } from './HeaderMenu'

type Props = {
  extraActions?: HeaderMenuAction[]
}

export function SupervisorHeaderMenu({ extraActions = [] }: Props) {
  const navigation = useNavigation<any>()

  const actions: HeaderMenuAction[] = [
    { label: 'Entregas', icon: 'cube-outline', onPress: () => navigation.navigate('SupervisorEntregas') },
    { label: 'Incidencias', icon: 'alert-circle-outline', onPress: () => navigation.navigate('SupervisorIncidencias') },
    { label: 'Zonas', icon: 'map-outline', onPress: () => navigation.navigate('SupervisorZones') },
    { label: 'Canales', icon: 'pricetag-outline', onPress: () => navigation.navigate('SupervisorChannels') },
    { label: 'Catalogo', icon: 'cube-outline', onPress: () => navigation.navigate('SupervisorProducts') },
    { label: 'Precios', icon: 'cash-outline', onPress: () => navigation.navigate('SupervisorPrices') },
    { label: 'Pedidos', icon: 'receipt-outline', onPress: () => navigation.navigate('SupervisorPedidos') },
    { label: 'Promociones', icon: 'sparkles-outline', onPress: () => navigation.navigate('SupervisorPromociones') },
    { label: 'Creditos', icon: 'card-outline', onPress: () => navigation.navigate('SupervisorCreditos') },
    { label: 'Vehiculos', icon: 'car-sport-outline', onPress: () => navigation.navigate('SupervisorVehiculos') },
    { label: 'Ruteros logisticos', icon: 'navigate-outline', onPress: () => navigation.navigate('SupervisorRuteros') },
    { label: 'Ruteros comerciales', icon: 'walk-outline', onPress: () => navigation.navigate('SupervisorRuterosComerciales') },
  ]

  return <HeaderMenu actions={[...actions, ...extraActions]} />
}

