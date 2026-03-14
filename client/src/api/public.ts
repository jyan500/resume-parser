import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { BACKEND_BASE_URL } from "../helpers/urls"

// initialize an empty api service that we'll inject endpoints into later as needed
export const publicApi = createApi({
	reducerPath: "public",
	baseQuery: fetchBaseQuery({
		baseUrl: BACKEND_BASE_URL
	}),
	endpoints: () => ({}),
})
