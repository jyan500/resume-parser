import { createListenerMiddleware } from "@reduxjs/toolkit"
import type { RootState, AppDispatch } from "./store"

// Bridges the React-owned Turnstile widget to non-React code (baseQuery).
// baseQuery dispatches actions; listeners react. See _components/Turnstile.tsx and api/baseQuery.ts.
// Lives outside store.ts to break the store → publicApi → baseQuery → store value-import cycle.
export const listenerMiddleware = createListenerMiddleware()

// Typed wrapper — gives listener `effect` callbacks correctly-typed state and dispatch.
export const startAppListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>()
