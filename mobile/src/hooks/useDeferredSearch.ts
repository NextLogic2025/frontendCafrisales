import { useState, useDeferredValue, useMemo, useCallback } from 'react'

/**
 * Hook for deferred search that prevents UI blocking during filtering.
 * Uses React 19's useDeferredValue to prioritize input responsiveness
 * over filtering computation.
 * 
 * @example
 * ```tsx
 * const { 
 *   searchText, 
 *   setSearchText, 
 *   deferredSearch, 
 *   isStale 
 * } = useDeferredSearch()
 * 
 * // Use deferredSearch for filtering (non-blocking)
 * const filtered = items.filter(item => 
 *   item.name.toLowerCase().includes(deferredSearch)
 * )
 * 
 * // Show loading indicator when search is stale
 * {isStale && <ActivityIndicator />}
 * ```
 */
export function useDeferredSearch(initialValue = '') {
    const [searchText, setSearchText] = useState(initialValue)
    
    // Deferred value for non-blocking filter operations
    const deferredSearch = useDeferredValue(searchText.trim().toLowerCase())
    
    // Indicates if the deferred value hasn't caught up yet
    const isStale = searchText.trim().toLowerCase() !== deferredSearch
    
    const clear = useCallback(() => {
        setSearchText('')
    }, [])
    
    return {
        /** Raw search text for controlled input */
        searchText,
        /** Setter for search text */
        setSearchText,
        /** Normalized deferred value (lowercase, trimmed) for filtering */
        deferredSearch,
        /** True when filter is computing (deferred hasn't caught up) */
        isStale,
        /** Clear search text */
        clear,
    }
}

/**
 * Hook for filtering items with deferred search.
 * Combines useDeferredSearch with memoized filtering.
 * 
 * @example
 * ```tsx
 * const {
 *   searchText,
 *   setSearchText,
 *   filteredItems,
 *   isStale
 * } = useDeferredFilter(orders, (order, query) => 
 *   order.numero_pedido.toLowerCase().includes(query) ||
 *   order.cliente_nombre.toLowerCase().includes(query)
 * )
 * ```
 */
export function useDeferredFilter<T>(
    items: T[],
    filterFn: (item: T, normalizedQuery: string) => boolean,
    initialValue = ''
) {
    const { searchText, setSearchText, deferredSearch, isStale, clear } = useDeferredSearch(initialValue)
    
    const filteredItems = useMemo(() => {
        if (!deferredSearch) return items
        return items.filter(item => filterFn(item, deferredSearch))
    }, [items, deferredSearch, filterFn])
    
    return {
        searchText,
        setSearchText,
        filteredItems,
        isStale,
        clear,
    }
}
