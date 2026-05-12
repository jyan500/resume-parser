"use client"

import React, { useEffect, useRef } from "react"
import { Turnstile as TurnstileWidget, type TurnstileInstance } from "@marsidev/react-turnstile"
import { useAppDispatch } from "../_lib/store"
import { startAppListening } from "../_lib/listenerMiddleware"
import {
	setTurnstileToken,
	setDevBypass,
	requestRefresh,
} from "../_lib/slices/turnstileSlice"

export function Turnstile({ children }: { children: React.ReactNode }) {
	const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
	const dispatch = useAppDispatch()
	const ref = useRef<TurnstileInstance>(null)

	useEffect(() => {
		const isDevBypass = !siteKey
		dispatch(setDevBypass(isDevBypass))
		if (isDevBypass) dispatch(setTurnstileToken("dev-bypass"))

		// This listener lives here (not in store.ts) because its effect needs closure access
		// to `ref` — the widget instance is owned by this component and doesn't exist at
		// module-load time. baseQuery dispatches requestRefresh after each request; this
		// listener calls widget.reset(), which causes Turnstile to mint a new token and fire
		// onSuccess, which dispatches setTurnstileToken, which resolves any pending
		// awaitNextToken promises in baseQuery.
		const stop = startAppListening({
			actionCreator: requestRefresh,
			effect: () => {
				ref.current?.reset()
			},
		})
		return stop
	}, [dispatch, siteKey])

	function handleSuccess(token: string) {
		dispatch(setTurnstileToken(token))
	}

	return (
		<>
			{children}
			{siteKey && (
				<TurnstileWidget
					ref={ref}
					siteKey={siteKey}
					onSuccess={handleSuccess}
					options={{ size: "invisible" }}
				/>
			)}
		</>
	)
}
