import {
    createApi,
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
} from "@reduxjs/toolkit/query/react";
import type { CustomError } from "../types/api";
import { BACKEND_BASE_URL } from "../helpers/urls";

const rawBaseQuery = fetchBaseQuery({ baseUrl: BACKEND_BASE_URL });

export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, CustomError> = async (
    args,
    api,
    extraOptions
) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    console.log("result: ", result);

    if ("error" in result) {
        const status = String(result?.error?.status);

        // Server usually returns this in error.data
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