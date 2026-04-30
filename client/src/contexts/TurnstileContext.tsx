import React, { createContext, useContext, useEffect, useRef } from "react"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { useAppDispatch } from "../store"
import { setTurnstileToken, clearTurnstileToken } from "../slices/turnstileSlice"

interface TurnstileContextValue {
    resetToken: () => void
}

const TurnstileContext = createContext<TurnstileContextValue>({ resetToken: () => {} })

export function TurnstileProvider({ children }: { children: React.ReactNode }) {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
    const dispatch = useAppDispatch()
    const ref = useRef<TurnstileInstance>(null)

    useEffect(() => {
        if (!siteKey) dispatch(setTurnstileToken("dev-bypass"))
    }, [dispatch, siteKey])

    function handleSuccess(token: string) {
        dispatch(setTurnstileToken(token))
    }

    function resetToken() {
        if (!siteKey) return
        dispatch(clearTurnstileToken())
        ref.current?.reset()
    }

    return (
        <TurnstileContext.Provider value={{ resetToken }}>
            {children}
            {siteKey && (
                <Turnstile
                    ref={ref}
                    siteKey={siteKey}
                    onSuccess={handleSuccess}
                    options={{ size: "invisible" }}
                />
            )}
        </TurnstileContext.Provider>
    )
}

export const useTurnstile = () => useContext(TurnstileContext)
