import { debounce } from "lodash"
import { useEffect, useMemo, useRef } from "react"

/**
 * Returns a stable, debounced version of `callback` that always runs the
 * latest callback passed in. The returned function exposes lodash's `flush`
 * (run the pending call now, e.g. on blur) and `cancel`. Pending calls are
 * cancelled on unmount.
 *
 * ```
 *  const save = useDebouncedCallback((value: string) => persist(value), 1000)
 *  <input onChange={(e) => save(e.target.value)} onBlur={() => save.flush()} />
 * ```
 */
const useDebouncedCallback = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  wait: number
) => {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  })

  const debounced = useMemo(
    () => debounce((...args: Args) => callbackRef.current(...args), wait),
    [wait]
  )

  useEffect(() => () => debounced.cancel(), [debounced])

  return debounced
}

export default useDebouncedCallback
