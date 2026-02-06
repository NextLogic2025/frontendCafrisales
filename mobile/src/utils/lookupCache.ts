import AsyncStorage from '@react-native-async-storage/async-storage'

type CacheEntry = {
  value: string
  expiresAt: number
}

const DEFAULT_TTL_MS = 10 * 60 * 1000
const STORAGE_KEYS = {
  orderLabels: 'cafri:cache:orderLabels',
  clientNames: 'cafri:cache:clientNames',
  driverNames: 'cafri:cache:driverNames',
}

const orderLabelCache = new Map<string, CacheEntry>()
const clientNameCache = new Map<string, CacheEntry>()
const driverNameCache = new Map<string, CacheEntry>()

let preloadPromise: Promise<void> | null = null

const isFresh = (entry?: CacheEntry) => !!entry && entry.expiresAt > Date.now()

const getFromCache = (cache: Map<string, CacheEntry>, key: string) => {
  const entry = cache.get(key)
  if (isFresh(entry)) return entry!.value
  if (entry) cache.delete(key)
  return null
}

const setInCache = (cache: Map<string, CacheEntry>, key: string, value: string, ttl = DEFAULT_TTL_MS) => {
  cache.set(key, { value, expiresAt: Date.now() + ttl })
}

const persistCache = async (key: string, cache: Map<string, CacheEntry>) => {
  try {
    const payload = Object.fromEntries(cache.entries())
    await AsyncStorage.setItem(key, JSON.stringify(payload))
  } catch {
    // ignore persistence errors
  }
}

const hydrateCache = async (key: string, cache: Map<string, CacheEntry>) => {
  try {
    const raw = await AsyncStorage.getItem(key)
    if (!raw) return
    const parsed = JSON.parse(raw) as Record<string, CacheEntry>
    Object.entries(parsed).forEach(([id, entry]) => {
      if (entry && entry.value && entry.expiresAt && entry.expiresAt > Date.now()) {
        cache.set(id, entry)
      }
    })
  } catch {
    // ignore hydrate errors
  }
}

export const lookupCache = {
  async preload() {
    if (!preloadPromise) {
      preloadPromise = Promise.all([
        hydrateCache(STORAGE_KEYS.orderLabels, orderLabelCache),
        hydrateCache(STORAGE_KEYS.clientNames, clientNameCache),
        hydrateCache(STORAGE_KEYS.driverNames, driverNameCache),
      ]).then(() => undefined)
    }
    return preloadPromise
  },
  getOrderLabel: (orderId: string) => getFromCache(orderLabelCache, orderId),
  setOrderLabel: (orderId: string, label: string) => {
    setInCache(orderLabelCache, orderId, label)
    persistCache(STORAGE_KEYS.orderLabels, orderLabelCache)
  },
  getClientName: (orderId: string) => getFromCache(clientNameCache, orderId),
  setClientName: (orderId: string, name: string) => {
    setInCache(clientNameCache, orderId, name)
    persistCache(STORAGE_KEYS.clientNames, clientNameCache)
  },
  getDriverName: (driverId: string) => getFromCache(driverNameCache, driverId),
  setDriverName: (driverId: string, name: string) => {
    setInCache(driverNameCache, driverId, name)
    persistCache(STORAGE_KEYS.driverNames, driverNameCache)
  },
}
