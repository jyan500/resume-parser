import { createApi } from "@reduxjs/toolkit/query/react"
import { externalBaseQuery } from "./externalBaseQuery"

// API service for third-party endpoints (Web3Forms, etc.) that bypass the
// Turnstile-gated backend baseQuery. Endpoints are injected from feature-specific files.
export const externalApi = createApi({
	reducerPath: "external",
	baseQuery: externalBaseQuery,
	endpoints: () => ({}),
})
