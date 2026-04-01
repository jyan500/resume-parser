import { publicApi } from "../public"
import type { ListResponse } from "../../types/api"

export const genericApi = publicApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		genericFetch: builder.query<ListResponse<any>, { endpoint: string, urlParams: Record<string, any>}>({
			query: ({ endpoint, urlParams}) => ({
				url: endpoint,
				method: "GET",	
				params: urlParams
			}),
			transformResponse: (responseData: ListResponse<{ id: number; name: string }>) => ({
				...responseData,
				items: responseData.items.map((d) => ({
					label: d.name,
					value: String(d.id),
				})),
			})
		}),
	})
})

export const {
	useGenericFetchQuery,
	useLazyGenericFetchQuery,
} = genericApi
