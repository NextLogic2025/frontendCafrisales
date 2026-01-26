import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking, RefreshControl } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { BRAND_COLORS } from '../../../../shared/types'
import { UserClientService, UserClient } from '../../../../services/api/UserClientService'
import { Zone, ZoneService } from '../../../../services/api/ZoneService'
import { MiniMapPreview } from '../../../../components/ui/MiniMapPreview'

export function SupervisorClientDetailScreen() {
    const route = useRoute<any>()
    const navigation = useNavigation<any>()

    const clientParam: UserClient | undefined = route.params?.client
    const clientId: string | undefined = clientParam?.usuario_id || route.params?.clientId

    const [client, setClient] = useState<UserClient | null>(clientParam || null)
    const [zone, setZone] = useState<Zone | null>(null)
    const [loading, setLoading] = useState(false)

    const loadData = async () => {
        if (!clientId) return
        setLoading(true)
        try {
            const clientData = await UserClientService.getClient(clientId)
            setClient(clientData)
            if (clientData?.zona_id) {
                const zoneData = await ZoneService.getZoneById(clientData.zona_id)
                setZone(zoneData)
            } else {
                setZone(null)
            }
        } catch (e) {
            console.error('Error cargando detalle del cliente:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
        const unsub = navigation.addListener('focus', loadData)
        return unsub
    }, [navigation])

    const openInGoogleMaps = (lat: number, lon: number, title: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
        Linking.openURL(url).catch(err => console.error('Error abriendo Google Maps:', err))
    }

    if (loading && !client) {
        return (
            <View className="flex-1 bg-neutral-50">
                <Header
                    title="Detalle Cliente"
                    variant="standard"
                    onBackPress={() => navigation.goBack()}
                    rightElement={<SupervisorHeaderMenu />}
                />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={BRAND_COLORS.red} />
                    <Text className="text-neutral-500 mt-4 text-sm">Cargando informacion...</Text>
                </View>
            </View>
        )
    }

    if (!client) {
        return (
            <View className="flex-1 bg-neutral-50">
                <Header
                    title="Detalle Cliente"
                    variant="standard"
                    onBackPress={() => navigation.goBack()}
                    rightElement={<SupervisorHeaderMenu />}
                />
                <View className="flex-1 items-center justify-center px-6">
                    <View className="bg-neutral-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                        <Ionicons name="search-outline" size={40} color="#9CA3AF" />
                    </View>
                    <Text className="text-lg font-bold text-neutral-900 text-center mb-2">
                        Cliente no encontrado
                    </Text>
                    <Text className="text-neutral-500 text-center">
                        No se pudo cargar la informacion del cliente
                    </Text>
                </View>
            </View>
        )
    }

    const contactName = [client.nombres, client.apellidos].filter(Boolean).join(' ')
    const coordinatesReady = typeof client.latitud === 'number' && typeof client.longitud === 'number'

    return (
        <View className="flex-1 bg-neutral-50">
            <Header
                title="Detalle Cliente"
                variant="standard"
                onBackPress={() => navigation.goBack()}
                rightElement={<SupervisorHeaderMenu />}
            />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadData} tintColor={BRAND_COLORS.red} />
                }
            >
                <View className="px-5 py-4">
                    <View className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
                        <Text className="text-2xl font-bold text-neutral-900 mb-1" numberOfLines={2}>
                            {client.nombre_comercial}
                        </Text>
                        <Text className="text-neutral-600 text-sm font-medium">
                            {contactName || client.email || 'Sin contacto'}
                        </Text>

                        {client.ruc ? (
                            <View className="mt-3">
                                <Text className="text-neutral-500 text-xs font-medium mb-1">RUC</Text>
                                <Text className="text-neutral-900 text-sm font-semibold">{client.ruc}</Text>
                            </View>
                        ) : null}

                        <View className="mt-3">
                            <Text className="text-neutral-500 text-xs font-medium mb-1">Canal comercial</Text>
                            <Text className="text-neutral-900 text-sm font-semibold">
                                {client.canal_nombre || client.canal_codigo || 'Sin canal'}
                            </Text>
                        </View>

                        {zone ? (
                            <View className="mt-3">
                                <Text className="text-neutral-500 text-xs font-medium mb-1">Zona</Text>
                                <Text className="text-neutral-900 text-sm font-semibold">
                                    {zone.nombre} ({zone.codigo})
                                </Text>
                            </View>
                        ) : null}

                        <View className="mt-3">
                            <Text className="text-neutral-500 text-xs font-medium mb-1">Direccion</Text>
                            <Text className="text-neutral-900 text-sm font-semibold">
                                {client.direccion}
                            </Text>
                        </View>

                        {client.telefono ? (
                            <View className="mt-3">
                                <Text className="text-neutral-500 text-xs font-medium mb-1">Telefono</Text>
                                <Text className="text-neutral-900 text-sm font-semibold">{client.telefono}</Text>
                            </View>
                        ) : null}
                    </View>

                    {coordinatesReady ? (
                        <View className="mt-4">
                            <Text className="text-base font-bold text-neutral-900 mb-3">Ubicacion</Text>
                            <MiniMapPreview
                                height={240}
                                marker={{ latitude: client.latitud as number, longitude: client.longitud as number }}
                                center={{ latitude: client.latitud as number, longitude: client.longitud as number }}
                                onPress={() => openInGoogleMaps(client.latitud as number, client.longitud as number, client.nombre_comercial)}
                            />
                            <TouchableOpacity
                                onPress={() => openInGoogleMaps(client.latitud as number, client.longitud as number, client.nombre_comercial)}
                                className="flex-row items-center bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg mt-3"
                                activeOpacity={0.8}
                            >
                                <Ionicons name="navigate" size={16} color="#2563EB" />
                                <Text className="text-blue-700 font-semibold text-xs ml-2">
                                    Abrir en Google Maps
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        onPress={() => (navigation as any).navigate('SupervisorClientForm', { client })}
                        activeOpacity={0.7}
                        className="mt-6 flex-row items-center justify-center py-4 rounded-xl shadow-lg"
                        style={{ backgroundColor: BRAND_COLORS.red }}
                    >
                        <Ionicons name="pencil" size={20} color="white" />
                        <Text className="text-white font-bold text-base ml-2">
                            Editar Cliente
                        </Text>
                    </TouchableOpacity>

                    <View className="h-8" />
                </View>
            </ScrollView>
        </View>
    )
}
