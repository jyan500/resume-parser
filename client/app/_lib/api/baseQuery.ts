import {
	fetchBaseQuery,
	type BaseQueryFn,
	type FetchArgs,
} from "@reduxjs/toolkit/query/react";
import type { CustomError } from "../types/api";
import type { RootState } from "../store";
import { startAppListening } from "../listenerMiddleware";
import {
	setTurnstileToken,
	clearTurnstileToken,
	requestRefresh,
} from "../slices/turnstileSlice";
import { BACKEND_BASE_URL } from "../urls";

const TURNSTILE_TIMEOUT_MS = 15_000;

const rawBaseQuery = fetchBaseQuery({
	baseUrl: BACKEND_BASE_URL,
	prepareHeaders: (headers, { getState }) => {
		const token = (getState() as RootState).turnstile.token
		if (token) headers.set("X-Turnstile-Token", token)
		return headers
	},
});

// Per-call one-shot listener: registered when a request needs a fresh token, unsubscribed
// the moment setTurnstileToken fires (or on timeout). Dynamic registration is intentional —
// a single boot-time listener would need a module-level array of pending callers to fan out
// to, which would reintroduce the module-level mutable state this design avoids.
async function awaitNextToken(): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		const timeoutId = window.setTimeout(() => {
			stop();
			reject(new Error("Turnstile token refresh timed out"));
		}, TURNSTILE_TIMEOUT_MS);
		const stop = startAppListening({
			actionCreator: setTurnstileToken,
			effect: () => {
				clearTimeout(timeoutId);
				stop();
				resolve();
			},
		});
	});
}

export const baseQuery: BaseQueryFn<string | FetchArgs, unknown, CustomError> = async (
	args,
	api,
	extraOptions
) => {
	const turnstile = () => (api.getState() as RootState).turnstile;

	// No token in Redux — wait for the widget to mint one. The Turnstile component's listener
	// will see our requestRefresh dispatch from the previous request and call widget.reset(),
	// which eventually causes onSuccess → setTurnstileToken → awaitNextToken resolves.
	if (!turnstile().token && !turnstile().devBypass) {
		try {
			await awaitNextToken();
		} catch {
			return {
				error: {
					status: "TURNSTILE_TIMEOUT",
					errors: ["Verification unavailable. Please refresh the page and try again."],
				},
			};
		}
	}

	const result = await rawBaseQuery(args, api, extraOptions);

	// Cloudflare consumed the token on the request above. Clear it and signal the widget
	// (via the Turnstile component's listener) to mint a new one before the next request.
	if (!turnstile().devBypass) {
		api.dispatch(clearTurnstileToken());
		api.dispatch(requestRefresh());
	}

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
