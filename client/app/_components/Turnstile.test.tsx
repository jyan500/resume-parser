import { describe, it, expect, beforeEach, vi } from "vitest"
import { forwardRef, useImperativeHandle } from "react"
import { render, act } from "@testing-library/react"
import { Provider } from "react-redux"
import { store } from "../_lib/store"
import {
    clearTurnstileToken,
    setDevBypass,
    requestRefresh,
} from "../_lib/slices/turnstileSlice"

// ─── Mock @marsidev/react-turnstile ───────────────────────────────────────────
// The mock exposes hooks for tests to drive the widget's reset() method and to
// invoke the onSuccess callback as if Turnstile minted a new token.

const widgetReset = vi.fn()
let lastOnSuccess: ((token: string) => void) | null = null

vi.mock("@marsidev/react-turnstile", () => ({
    Turnstile: forwardRef<{ reset: () => void }, { siteKey: string; onSuccess: (token: string) => void }>(
        (props, ref) => {
            lastOnSuccess = props.onSuccess
            useImperativeHandle(ref, () => ({ reset: widgetReset }))
            return null
        }
    ),
}))

import { Turnstile } from "./Turnstile"

beforeEach(() => {
    widgetReset.mockReset()
    lastOnSuccess = null
    store.dispatch(clearTurnstileToken())
    store.dispatch(setDevBypass(false))
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "test-site-key")
})

function renderProvider() {
    return render(
        <Provider store={store}>
            <Turnstile>
                <div>child</div>
            </Turnstile>
        </Provider>
    )
}

describe("Turnstile component", () => {
    it("dispatches setTurnstileToken when the widget fires onSuccess", () => {
        renderProvider()
        act(() => { lastOnSuccess?.("new-token") })
        expect(store.getState().turnstile.token).toBe("new-token")
    })

    it("calls widget.reset() when requestRefresh is dispatched", () => {
        renderProvider()
        act(() => { store.dispatch(requestRefresh()) })
        expect(widgetReset).toHaveBeenCalledOnce()
    })

    it("unsubscribes the listener on unmount", () => {
        const { unmount } = renderProvider()
        unmount()
        act(() => { store.dispatch(requestRefresh()) })
        expect(widgetReset).not.toHaveBeenCalled()
    })

    it("dev bypass: when site key is unset, dispatches setDevBypass(true) and dev-bypass token on mount", () => {
        vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "")
        renderProvider()
        const state = store.getState().turnstile
        expect(state.devBypass).toBe(true)
        expect(state.token).toBe("dev-bypass")
    })
})
