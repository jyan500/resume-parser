import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface TurnstileState {
    token: string | null
}

const initialState: TurnstileState = { token: null }

const turnstileSlice = createSlice({
    name: "turnstile",
    initialState,
    reducers: {
        setTurnstileToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload
        },
        clearTurnstileToken: (state) => {
            state.token = null
        },
    },
})

export const { setTurnstileToken, clearTurnstileToken } = turnstileSlice.actions
export default turnstileSlice.reducer
