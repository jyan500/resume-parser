import { createSlice, createAction, type PayloadAction } from "@reduxjs/toolkit"

interface TurnstileState {
	token: string | null
	devBypass: boolean
}

const initialState: TurnstileState = { token: null, devBypass: false }

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
		setDevBypass: (state, action: PayloadAction<boolean>) => {
			state.devBypass = action.payload
		},
	},
})

export const { setTurnstileToken, clearTurnstileToken, setDevBypass } = turnstileSlice.actions

// Marker action — dispatched by baseQuery after each request to tell the Turnstile
// component's listener to call widget.reset(). No payload needed.
export const requestRefresh = createAction("turnstile/requestRefresh")

export default turnstileSlice.reducer
