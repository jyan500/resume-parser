import {
	fetchBaseQuery,
	type BaseQueryFn,
	type FetchArgs,
} from "@reduxjs/toolkit/query/react";
import type { CustomError } from "../types/api";

// Base query for third-party endpoints that should NOT go through the Turnstile-gated
// backend baseQuery (e.g. Web3Forms contact submissions). baseUrl is empty — endpoints
// supply fully-qualified URLs.
const rawBaseQuery = fetchBaseQuery({
	baseUrl: "",
});

export const externalBaseQuery: BaseQueryFn<string | FetchArgs, unknown, CustomError> = async (
	args,
	api,
	extraOptions
) => {
	const result = await rawBaseQuery(args, api, extraOptions);

	if ("error" in result) {
		const status = String(result?.error?.status);
		const data = result?.error?.data as Partial<CustomError> | undefined;

		return {
			error: {
				status: data?.status ?? status,
				errors: Array.isArray(data?.errors) ? data!.errors : ["Request failed"],
			},
		};
	}

	return result;
};
