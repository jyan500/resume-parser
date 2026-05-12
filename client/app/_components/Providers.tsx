"use client"

import React from "react"
import { Provider } from "react-redux"
import { store } from "../_lib/store"
import { Turnstile } from "./Turnstile"

// Client-only Provider boundary for the Next.js app. Wraps the entire tree so
// any descendant (server- or client-rendered) can render inside the Redux store
// and Turnstile token lifecycle.
//
// Intentionally no PersistGate. PersistGate's loading={null} blocks children
// until rehydration finishes, which would defeat SSR — server output would be
// empty. Instead, the server renders with initial Redux state; the client
// hydrates matching that state; persistStore rehydrates asynchronously after
// mount and any consumers re-render with persisted values. Acceptable cost:
// a one-frame flicker on returning users (e.g. Footer's "Continue editing"
// link appearing) — no hydration mismatch, no SEO loss.
export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<Provider store={store}>
			<Turnstile>{children}</Turnstile>
		</Provider>
	)
}
