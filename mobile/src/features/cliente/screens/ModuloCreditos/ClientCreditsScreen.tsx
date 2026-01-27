import React from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { jwtDecode } from 'jwt-decode'

import { Header } from '../../../../components/ui/Header'
import { ClientHeaderMenu } from '../../../../components/ui/ClientHeaderMenu'
import { CategoryFilter } from '../../../../components/ui/CategoryFilter'
import { BRAND_COLORS } from '../../../../shared/types'
import { CreditListItem, CreditService } from '../../../../services/api/CreditService'
import { getValidToken } from '../../../../services/auth/authClient'

const currencyFormatter = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

const formatMoney = (value?: number | string | null) => {
  const amount = Number(value)
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0)
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
}

const shortenId = (value?: string) => {
  if (!value) return '-'
  return `${value.slice(0, 8)}...`
}

type DecodedToken = { sub?: string; userId?: string }

export function ClientCreditsScreen() {
  const navigation = useNavigation<any>()
  const [credits, setCredits] = React.useState<CreditListItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'pendientes' | 'pagados'>('pendientes')
  const [searchText, setSearchText] = React.useState('')

  const loadCredits = React.useCallback(async () => {
    setLoading(true)
    try {
      const token = await getValidToken()
      if (!token) {
        setCredits([])
        return
      }
      const decoded = jwtDecode<DecodedToken>(token)
      const clienteId = decoded.sub || decoded.userId
      if (!clienteId) {
        setCredits([])
        return
      }
      const data = await CreditService.getCreditsByClient(clienteId, ['activo', 'vencido', 'pagado'])
      setCredits(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadCredits()
    }, [loadCredits]),
  )

  const matchesSearch = (value: string, search: string) => value.toLowerCase().includes(search.trim().toLowerCase())
  const normalizedSearch = searchText.trim().toLowerCase()

  const filtered = credits.filter((credit) => {
    if (!normalizedSearch) return true
    return matchesSearch(credit.pedido_id || '', normalizedSearch) || matchesSearch(credit.id || '', normalizedSearch)
  })

  const filteredPendientes = filtered.filter((credit) => {
    const estado = credit.estado ?? 'activo'
    return estado !== 'pagado' && estado !== 'cancelado'
  })
  const filteredPagados = filtered.filter((credit) => (credit.estado ?? '') === 'pagado')

  const renderItem = ({ item }: { item: CreditListItem }) => {
    const estado = item.estado || 'activo'
    const estadoColor = estado === 'pagado' ? '#059669' : estado === 'vencido' ? BRAND_COLORS.red : '#2563EB'
    const saldo = item.saldo ?? (item.monto_aprobado || 0)

    return (
      <Pressable
        onPress={() => navigation.navigate('ClienteCreditoDetalle', { creditId: item.id })}
        className="bg-white rounded-2xl border border-neutral-100 p-4 mb-4 shadow-sm"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Pedido</Text>
            <Text className="text-base font-bold text-neutral-900">#{shortenId(item.pedido_id)}</Text>
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
            <Text className="text-sm font-semibold text-neutral-900">{formatMoney(item.monto_aprobado)}</Text>
          </View>
          <View>
            <Text className="text-xs text-neutral-500">Saldo</Text>
            <Text className="text-sm font-semibold text-neutral-900">{formatMoney(saldo)}</Text>
          </View>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-neutral-500">Vence</Text>
            <Text className="text-xs text-neutral-700">{formatDate(item.fecha_vencimiento)}</Text>
          </View>
        </View>
      </Pressable>
    )
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <Header title="Creditos" variant="standard" rightElement={<ClientHeaderMenu />} />

      <CategoryFilter
        categories={[
          { id: 'pendientes', name: 'Pendientes' },
          { id: 'pagados', name: 'Pagados' },
        ]}
        selectedId={activeTab}
        onSelect={(id) => setActiveTab(id as 'pendientes' | 'pagados')}
        searchValue={searchText}
        onSearchChange={setSearchText}
        searchPlaceholder="Buscar por pedido"
      />

      {loading && credits.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND_COLORS.red} />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'pendientes' ? filteredPendientes : filteredPagados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCredits} tintColor={BRAND_COLORS.red} />}
          ListEmptyComponent={
            <View className="items-center justify-center py-14">
              <View className="p-4 rounded-full bg-red-50 mb-4">
                <Ionicons name="card-outline" size={36} color={BRAND_COLORS.red} />
              </View>
              <Text className="text-lg font-bold text-neutral-900 mb-2">
                {activeTab === 'pendientes' ? 'Sin creditos pendientes' : 'Sin creditos pagados'}
              </Text>
              <Text className="text-sm text-neutral-500 text-center">
                {activeTab === 'pendientes'
                  ? 'No tienes creditos en curso.'
                  : 'No tienes creditos pagados para mostrar.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  )
}
