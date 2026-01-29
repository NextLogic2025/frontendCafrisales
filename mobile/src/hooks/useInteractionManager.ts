import { useEffect, useState } from 'react'
import { InteractionManager } from 'react-native'

/**
 * Hook that delays expensive operations until after navigation animations complete.
 * This improves Time-To-Interactive (TTI) by letting the UI render first.
 *
 * @example
 * ```tsx
 * function HeavyScreen() {
 *   const isReady = useInteractionManager()
 *
 *   if (!isReady) {
 *     return <LoadingPlaceholder />
 *   }
 *
 *   return <ExpensiveComponent />
 * }
 * ```
 */
export function useInteractionManager(): boolean {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      setIsReady(true)
    })

    return () => handle.cancel()
  }, [])

  return isReady
}

/**
 * Hook that runs a callback after navigation animations complete.
 * Useful for deferring data fetching or heavy computations.
 *
 * @example
 * ```tsx
 * function DataScreen() {
 *   const [data, setData] = useState(null)
 *
 *   useDeferredEffect(() => {
 *     fetchExpensiveData().then(setData)
 *   }, [])
 *
 *   return data ? <DataView data={data} /> : <Loading />
 * }
 * ```
 */
export function useDeferredEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList,
): void {
  useEffect(() => {
    let cleanup: void | (() => void)

    const handle = InteractionManager.runAfterInteractions(() => {
      cleanup = effect()
    })

    return () => {
      handle.cancel()
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
