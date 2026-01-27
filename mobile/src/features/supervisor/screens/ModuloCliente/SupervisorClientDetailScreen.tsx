import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking, RefreshControl, Image } from 'react-native'
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
    const initials = client.nombre_comercial
        ? client.nombre_comercial.slice(0, 2).toUpperCase()
        : contactName
            ? contactName.slice(0, 2).toUpperCase()
            : 'CL'
    const avatarUrl = (client as any)?.url_avatar || (client as any)?.avatar_url || (client as any)?.img_url

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
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                <View className="px-5 py-4">
                    <View className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                        <View className="bg-brand-red px-5 py-6">
                            <View className="flex-row items-center">
                                <View className="h-16 w-16 rounded-2xl items-center justify-center bg-white/20 border border-white/30 overflow-hidden">
                                    {avatarUrl ? (
                                        <Image source={{ uri: avatarUrl }} className="h-full w-full" resizeMode="cover" />
                                    ) : (
                                        <Text className="text-white text-lg font-bold">{initials}</Text>
                                    )}
                                </View>
                                <View className="flex-1 ml-4">
                                    <Text className="text-white text-xl font-bold" numberOfLines={2}>
                                        {client.nombre_comercial}
                                    </Text>
                                    <Text className="text-white/80 text-sm mt-1" numberOfLines={1}>
                                        {contactName || client.email || 'Sin contacto'}
                                    </Text>
                                    <View className="flex-row items-center mt-2">
                                        <View className="px-3 py-1 rounded-full bg-white/20">
                                            <Text className="text-white text-[11px] font-semibold">
                                                {client.estado === 'inactivo' ? 'Inactivo' : 'Activo'}
                                            </Text>
                                        </View>
                                        {client.canal_nombre || client.canal_codigo ? (
                                            <View className="px-3 py-1 rounded-full bg-white/20 ml-2">
                                                <Text className="text-white text-[11px] font-semibold">
                                                    {client.canal_nombre || client.canal_codigo}
                                                </Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View className="px-5 py-5">
                            <View className="flex-row flex-wrap gap-2">
                                {client.ruc ? (
                                    <View className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200">
                                        <Text className="text-[10px] text-neutral-400 font-semibold">RUC</Text>
                                        <Text className="text-sm text-neutral-900 font-semibold">{client.ruc}</Text>
                                    </View>
                                ) : null}
                                {zone ? (
                                    <View className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200">
                                        <Text className="text-[10px] text-neutral-400 font-semibold">Zona</Text>
                                        <Text className="text-sm text-neutral-900 font-semibold">
                                            {zone.nombre} ({zone.codigo})
                                        </Text>
                                    </View>
                                ) : null}
                            </View>

                            <View className="mt-4 bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3">
                                <Text className="text-[10px] uppercase text-neutral-400 font-bold">Direccion</Text>
                                <Text className="text-sm text-neutral-900 mt-1">{client.direccion}</Text>
                            </View>

                            {client.telefono ? (
                                <View className="mt-3 bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3">
                                    <Text className="text-[10px] uppercase text-neutral-400 font-bold">Telefono</Text>
                                    <Text className="text-sm text-neutral-900 mt-1">{client.telefono}</Text>
                                </View>
                            ) : null}
                        </View>
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
