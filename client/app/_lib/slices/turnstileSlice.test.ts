import { describe, it, expect } from "vitest"
import reducer, {
    setTurnstileToken,
    clearTurnstileToken,
    setDevBypass,
    requestRefresh,
} from "./turnstileSlice"

const fresh = () => ({ token: null as string | null, devBypass: false })

describe("turnstileSlice", () => {
    it("setTurnstileToken stores the token", () => {
        const state = reducer(fresh(), setTurnstileToken("abc"))
        expect(state.token).toBe("abc")
    })

    it("clearTurnstileToken nulls the token", () => {
        const state = reducer({ token: "abc", devBypass: false }, clearTurnstileToken())
        expect(state.token).toBeNull()
    })

    it("setDevBypass toggles the flag", () => {
        const enabled = reducer(fresh(), setDevBypass(true))
        expect(enabled.devBypass).toBe(true)
        const disabled = reducer(enabled, setDevBypass(false))
        expect(disabled.devBypass).toBe(false)
    })

    it("requestRefresh is a marker action", () => {
        const action = requestRefresh()
        expect(action.type).toBe("turnstile/requestRefresh")
        expect(action.payload).toBeUndefined()
    })

    it("requestRefresh does not mutate state", () => {
        const before = fresh()
        const after = reducer(before, requestRefresh())
        expect(after).toEqual(before)
    })
})
