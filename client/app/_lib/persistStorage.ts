// SSR-safe storage for redux-persist.
//
// redux-persist's bundled storage modules (`redux-persist/lib/storage` and
// `/storage/session`) check for `window` at module load and, when absent
// (server-side), fall back to a noop storage AND emit a console warning:
//   "redux-persist failed to create sync storage. falling back to noop storage."
//
// Under Next.js App Router, the store module is imported by the (`"use client"`)
// Providers component, but Next still evaluates client components on the server
// to produce initial HTML — so the warning fires on every SSR pass.
//
// This module returns the same noop behavior on the server (correct: no
// localStorage exists during SSR, and persistStore's rehydrate is a no-op),
// without the warning. On the client it delegates to localStorage or
// sessionStorage based on the type argument.

type WebStorageType = "local" | "session"

interface PersistStorage {
	getItem(key: string): Promise<string | null>
	setItem(key: string, value: string): Promise<string>
	removeItem(key: string): Promise<void>
}

const noopStorage: PersistStorage = {
	getItem: () => Promise.resolve(null),
	setItem: (_key, value) => Promise.resolve(value),
	removeItem: () => Promise.resolve(),
}

function createWebStorage(type: WebStorageType): PersistStorage {
	if (typeof window === "undefined") return noopStorage

	const backing = type === "local" ? window.localStorage : window.sessionStorage
	return {
		getItem: (key) => Promise.resolve(backing.getItem(key)),
		setItem: (key, value) => {
			backing.setItem(key, value)
			return Promise.resolve(value)
		},
		removeItem: (key) => {
			backing.removeItem(key)
			return Promise.resolve()
		},
	}
}

export const localStorage = createWebStorage("local")
export const sessionStorage = createWebStorage("session")
