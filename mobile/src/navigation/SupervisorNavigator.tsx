import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TabNavigation } from '../components/ui/TabNavigation'

import { SupervisorDashboardScreen } from '../features/supervisor/screens/ModuloInicio/SupervisorDashboardScreen'
import { SupervisorClientsScreen } from '../features/supervisor/screens/ModuloCliente/SupervisorClientsScreen'
import { SupervisorClientDetailScreen } from '../features/supervisor/screens/ModuloCliente/SupervisorClientDetailScreen'
import { SupervisorClientFormScreen } from '../features/supervisor/screens/ModuloCliente/SupervisorClientFormScreen'
import { SupervisorChannelsScreen } from '../features/supervisor/screens/ModuloCanales/SupervisorChannelsScreen'
import { SupervisorChannelDetailScreen } from '../features/supervisor/screens/ModuloCanales/SupervisorChannelDetailScreen'
import { SupervisorChannelFormScreen } from '../features/supervisor/screens/ModuloCanales/SupervisorChannelFormScreen'
import { SupervisorTeamScreen } from '../features/supervisor/screens/ModuloMiEquipo/SupervisorTeamScreen'
import { SupervisorTeamDetailScreen } from '../features/supervisor/screens/ModuloMiEquipo/SupervisorTeamDetailScreen'
import { SupervisorProfileScreen } from '../features/supervisor/screens/ModuloPerfil/SupervisorProfileScreen'
import { SupervisorZonesScreen } from '../features/supervisor/screens/ModuloZonas/SupervisorZonesScreen'
import { SupervisorZoneDetailScreen } from '../features/supervisor/screens/ModuloZonas/SupervisorZoneDetailScreen'
import { SupervisorZonesMapScreen } from '../features/supervisor/screens/ModuloZonas/SupervisorZonesMapScreen'
import { SupervisorProductsScreen } from '../features/supervisor/screens/ModuloCatalogo/ModuloProductos/SupervisorProductsScreen'
import { SupervisorProductDetailScreen } from '../features/supervisor/screens/ModuloCatalogo/ModuloProductos/SupervisorProductDetailScreen'
import { SupervisorProductFormScreen } from '../features/supervisor/screens/ModuloCatalogo/ModuloProductos/SupervisorProductFormScreen'
import { SupervisorCategoriesScreen } from '../features/supervisor/screens/ModuloCatalogo/ModuloCategorias/SupervisorCategoriesScreen'
import { SupervisorCategoryDetailScreen } from '../features/supervisor/screens/ModuloCatalogo/ModuloCategorias/SupervisorCategoryDetailScreen'
import { SupervisorCategoryFormScreen } from '../features/supervisor/screens/ModuloCatalogo/ModuloCategorias/SupervisorCategoryFormScreen'
import { SupervisorSkusScreen } from '../features/supervisor/screens/ModuloCatalogo/ModuloSKU/SupervisorSkusScreen'
import { SupervisorSkuDetailScreen } from '../features/supervisor/screens/ModuloCatalogo/ModuloSKU/SupervisorSkuDetailScreen'
import { SupervisorSkuFormScreen } from '../features/supervisor/screens/ModuloCatalogo/ModuloSKU/SupervisorSkuFormScreen'
import { SupervisorPricesScreen } from '../features/supervisor/screens/ModuloCatalogo/ModuloPrecios/SupervisorPricesScreen'
import { SupervisorPriceDetailScreen } from '../features/supervisor/screens/ModuloCatalogo/ModuloPrecios/SupervisorPriceDetailScreen'
import { SupervisorPriceFormScreen } from '../features/supervisor/screens/ModuloCatalogo/ModuloPrecios/SupervisorPriceFormScreen'
import { SupervisorCreditsScreen } from '../features/supervisor/screens/ModuloCreditos/SupervisorCreditsScreen'
import { SupervisorCreditApprovalsScreen } from '../features/supervisor/screens/ModuloCreditos/SupervisorCreditApprovalsScreen'
import { SupervisorCreditRequestDetailScreen } from '../features/supervisor/screens/ModuloCreditos/SupervisorCreditRequestDetailScreen'
import { SupervisorCreditDetailScreen } from '../features/supervisor/screens/ModuloCreditos/SupervisorCreditDetailScreen'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function SupervisorTabs() {
    return (
        <Tab.Navigator
            tabBar={(props) => <TabNavigation {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Inicio" component={SupervisorDashboardScreen} />
            <Tab.Screen name="Clientes" component={SupervisorClientsScreen} />
            <Tab.Screen name="Equipo" component={SupervisorTeamScreen} />
            <Tab.Screen name="Perfil" component={SupervisorProfileScreen} />
        </Tab.Navigator>
    )
}

export function SupervisorNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SupervisorTabs" component={SupervisorTabs} />
            <Stack.Screen name="SupervisorZones" component={SupervisorZonesScreen} />
            <Stack.Screen name="SupervisorZonesMap" component={SupervisorZonesMapScreen} />
            <Stack.Screen name="SupervisorChannels" component={SupervisorChannelsScreen} />
            <Stack.Screen name="SupervisorChannelDetail" component={SupervisorChannelDetailScreen} />
            <Stack.Screen name="SupervisorChannelForm" component={SupervisorChannelFormScreen} />
            <Stack.Screen name="SupervisorProducts" component={SupervisorProductsScreen} />
            <Stack.Screen name="SupervisorProductDetail" component={SupervisorProductDetailScreen} />
            <Stack.Screen name="SupervisorProductForm" component={SupervisorProductFormScreen} />
            <Stack.Screen name="SupervisorCategories" component={SupervisorCategoriesScreen} />
            <Stack.Screen name="SupervisorCategoryDetail" component={SupervisorCategoryDetailScreen} />
            <Stack.Screen name="SupervisorCategoryForm" component={SupervisorCategoryFormScreen} />
            <Stack.Screen name="SupervisorSkus" component={SupervisorSkusScreen} />
            <Stack.Screen name="SupervisorSkuDetail" component={SupervisorSkuDetailScreen} />
            <Stack.Screen name="SupervisorSkuForm" component={SupervisorSkuFormScreen} />
            <Stack.Screen name="SupervisorPrices" component={SupervisorPricesScreen} />
            <Stack.Screen name="SupervisorPriceDetail" component={SupervisorPriceDetailScreen} />
            <Stack.Screen name="SupervisorPriceForm" component={SupervisorPriceFormScreen} />
            <Stack.Screen name="SupervisorClientDetail" component={SupervisorClientDetailScreen} />
            <Stack.Screen name="SupervisorClientForm" component={SupervisorClientFormScreen} />
            <Stack.Screen name="SupervisorTeamDetail" component={SupervisorTeamDetailScreen} />
            <Stack.Screen name="SupervisorZoneDetail" component={SupervisorZoneDetailScreen} />
            <Stack.Screen name="SupervisorCreditos" component={SupervisorCreditsScreen} />
            <Stack.Screen name="SupervisorSolicitudesCredito" component={SupervisorCreditApprovalsScreen} />
            <Stack.Screen name="SupervisorSolicitudCreditoDetalle" component={SupervisorCreditRequestDetailScreen} />
            <Stack.Screen name="SupervisorCreditoDetalle" component={SupervisorCreditDetailScreen} />
        </Stack.Navigator>
    )
}
