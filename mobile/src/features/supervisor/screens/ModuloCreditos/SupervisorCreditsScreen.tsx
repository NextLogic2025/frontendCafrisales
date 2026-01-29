import React from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '../../../../components/ui/Header'
import { SupervisorHeaderMenu } from '../../../../components/ui/SupervisorHeaderMenu'
import { GenericModal } from '../../../../components/ui/GenericModal'
import { SearchBar } from '../../../../components/ui/SearchBar'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { BRAND_COLORS } from '../../../../shared/types'
import { CreditService, CreditListItem } from '../../../../services/api/CreditService'
import { UserClientService } from '../../../../services/api/UserClientService'
import { UserService, UserProfile } from '../../../../services/api/UserService'

const formatMoney = (value: number) => {
  const fixed = Number.isFinite(value) ? value.toFixed(2) : '0.00'
  return `USD ${fixed}`
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function SupervisorCreditsScreen() {
  const navigation = useNavigation<any>()
  const [credits, setCredits] = React.useState<CreditListItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [clientNameMap, setClientNameMap] = React.useState<Record<string, string>>({})
  const [search, setSearch] = React.useState('')
  const [vendors, setVendors] = React.useState<UserProfile[]>([])
  const [vendorModalVisible, setVendorModalVisible] = React.useState(false)
  const [vendorSearch, setVendorSearch] = React.useState('')
  const [selectedVendorId, setSelectedVendorId] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<'pendientes' | 'pagados' | 'rechazados'>('pendientes')

  const loadCredits = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = selectedVendorId
        ? await CreditService.getCreditsBySeller(selectedVendorId, ['activo', 'vencido', 'pagado'])
        : await CreditService.getCreditsAll(['activo', 'vencido', 'pagado'])
      setCredits(data)

      const uniqueClientIds = Array.from(new Set(data.map((credit) => credit.cliente_id).filter(Boolean)))
      if (uniqueClientIds.length === 0) {
        setClientNameMap({})
        return
      }
      const pairs = await Promise.all(
        uniqueClientIds.map(async (clienteId) => {
          const client = await UserClientService.getClient(clienteId)
          return [clienteId, client?.nombre_comercial || client?.ruc || clienteId] as const
        }),
      )
      setClientNameMap(Object.fromEntries(pairs))
    } finally {
      setLoading(false)
    }
  }, [selectedVendorId])

  const loadVendors = React.useCallback(async () => {
    try {
      const data = await UserService.getVendors()
      setVendors(data)
    } catch {
      setVendors([])
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadCredits()
      loadVendors()
    }, [loadCredits, loadVendors]),
  )

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return credits
    return credits.filter((item) => {
      const clientLabel = clientNameMap[item.cliente_id]?.toLowerCase() || ''
      return (
        item.pedido_id?.toLowerCase().includes(term) ||
        item.cliente_id?.toLowerCase().includes(term) ||
        clientLabel.includes(term)
      )
    })
  }, [credits, search, clientNameMap])

  const filteredPendientes = filtered.filter((credit) => {
    const estado = credit.estado ?? 'activo'
    return estado !== 'pagado' && estado !== 'cancelado'
  })
  const filteredPagados = filtered.filter((credit) => (credit.estado ?? '') === 'pagado')
  const filteredRechazados = filtered.filter((credit) => (credit.estado ?? '') === 'cancelado')

  const renderItem = ({ item }: { item: CreditListItem }) => {
    const estado = item.estado || 'activo'
    const estadoColor =
      estado === 'pagado' ? '#059669' : estado === 'vencido' ? BRAND_COLORS.red : '#2563EB'
    const saldo = item.saldo ?? (item.monto_aprobado || 0)
    const clientLabel = clientNameMap[item.cliente_id] || item.cliente_id

    return (
      <Pressable
        onPress={() => navigation.navigate('SupervisorCreditoDetalle', { creditId: item.id })}
        className="bg-white rounded-2xl border border-neutral-100 p-4 mb-4 shadow-sm"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Pedido</Text>
            <Text className="text-base font-bold text-neutral-900">{item.pedido_id?.slice(0, 8)}...</Text>
          </View>
          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: `${estadoColor}22` }}>
            <Text className="text-xs font-semibold" style={{ color: estadoColor }}>
              {estado.toUpperCase()}
            </Text>
          </View>
        </View>

        <View className="mt-3 flex-row justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Monto aprobado</Text>
            <Text className="text-sm font-semibold text-neutral-900">
              {formatMoney(Number(item.monto_aprobado ?? 0))}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-neutral-500">Saldo</Text>
            <Text className="text-sm font-semibold text-neutral-900">{formatMoney(Number(saldo))}</Text>
          </View>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Cliente</Text>
            <Text className="text-xs text-neutral-700" numberOfLines={1}>{clientLabel}</Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-neutral-500">Vence</Text>
            <Text className="text-xs text-neutral-700">{formatDate(item.fecha_vencimiento)}</Text>
          </View>
        </View>
      </Pressable>
    )
  }

  const selectedVendor = vendors.find((vendor) => vendor.id === selectedVendorId)
  const vendorButtonLabel = selectedVendor?.name || 'Vendedor'

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Creditos" variant="standard" rightElement={<SupervisorHeaderMenu />} />

      <CategoryFilter
        categories={[
          { id: 'pendientes', name: 'Pendientes' },
          { id: 'pagados', name: 'Pagados' },
          { id: 'rechazados', name: 'Rechazados' },
        ]}
        selectedId={activeTab}
        onSelect={(id) => setActiveTab(id as 'pendientes' | 'pagados' | 'rechazados')}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por cliente o pedido"
        actionLabel={vendorButtonLabel}
        onActionPress={() => setVendorModalVisible(true)}
      />

      {loading && credits.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <FlatList
          data={
            activeTab === 'pendientes'
              ? filteredPendientes
              : activeTab === 'rechazados'
                ? filteredRechazados
                : filteredPagados
          }
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCredits} tintColor={BRAND_COLORS.red} />}
          ListEmptyComponent={
            <View className="items-center justify-center py-14">
              <View className="p-4 rounded-full bg-red-50 mb-4">
                <Ionicons name="cash-outline" size={36} color={BRAND_COLORS.red} />
              </View>
              <Text className="text-lg font-bold text-neutral-900 mb-2">
                {activeTab === 'pendientes'
                  ? 'Sin creditos pendientes'
                  : activeTab === 'rechazados'
                    ? 'Sin creditos rechazados'
                    : 'Sin creditos pagados'}
              </Text>
              <Text className="text-sm text-neutral-500 text-center">
                {activeTab === 'pendientes'
                  ? 'No hay creditos pendientes para mostrar.'
                  : activeTab === 'rechazados'
                    ? 'No hay creditos rechazados para mostrar.'
                    : 'No hay creditos pagados para mostrar.'}
              </Text>
            </View>
          }
        />
      )}

      <GenericModal
        visible={vendorModalVisible}
        title="Seleccionar vendedor"
        onClose={() => setVendorModalVisible(false)}
      >
        <View className="gap-4">
          <SearchBar
            value={vendorSearch}
            onChangeText={setVendorSearch}
            onClear={() => setVendorSearch('')}
            placeholder="Buscar vendedor"
          />
          <Pressable
            onPress={() => {
              setSelectedVendorId(null)
              setVendorModalVisible(false)
            }}
            className="px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50"
          >
            <Text className="text-sm font-semibold text-neutral-700">Todos los vendedores</Text>
          </Pressable>
          <View className="max-h-80">
            {vendors
              .filter((vendor) => {
                if (!vendorSearch.trim()) return true
                const query = vendorSearch.trim().toLowerCase()
                const label = `${vendor.name || ''} ${vendor.email || ''}`.toLowerCase()
                return label.includes(query)
              })
              .map((vendor) => (
                <Pressable
                  key={vendor.id}
                  onPress={() => {
                    setSelectedVendorId(vendor.id)
                    setVendorModalVisible(false)
                  }}
                  className="px-4 py-3 rounded-xl border border-neutral-100 bg-white mb-2"
                >
                  <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
                    {vendor.name || vendor.email || vendor.id}
                  </Text>
                  {vendor.email ? <Text className="text-xs text-neutral-500">{vendor.email}</Text> : null}
                </Pressable>
              ))}
            {vendors.length === 0 && (
              <Text className="text-sm text-neutral-500 text-center py-6">No hay vendedores.</Text>
            )}
          </View>
        </View>
      </GenericModal>
    </View>
  )
}
