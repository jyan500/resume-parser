import { useEffect, useState } from "react"

/**
 * Returns true once the component has mounted on the client. Use this to gate
 * UI that depends on persisted Redux state (or any other client-only data) so
 * the first client render matches what the server emitted.
 *
 * Without it, redux-persist's REHYDRATE dispatches in a microtask between
 * bundle load and React's hydration commit — the client tree diverges from
 * the server tree on first render and React throws a hydration mismatch.
 */
export const useIsHydrated = (): boolean => {
	const [hydrated, setHydrated] = useState(false)
	useEffect(() => {
		setHydrated(true)
	}, [])
	return hydrated
}
