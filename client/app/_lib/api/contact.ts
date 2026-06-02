import { externalApi } from "./external"
import { WEB3FORMS_ENDPOINT } from "../constants"

export interface ContactMessageRequest {
	name: string
	email: string
	subject: string
	message: string
	botcheck: string
}

// Web3Forms returns { success, message } on both ok and rejection paths.
// success: false on a 2xx response (e.g. invalid access_key) is treated as an
// error by the calling component — RTK Query itself only branches on HTTP status.
export interface Web3FormsResponse {
	success: boolean
	message: string
}

export const contactApi = externalApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		sendContactMessage: builder.mutation<Web3FormsResponse, ContactMessageRequest>({
			query: (body) => ({
				url: WEB3FORMS_ENDPOINT,
				method: "POST",
				headers: {
					Accept: "application/json",
				},
				body: {
					access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "",
					from_name: "CVSquared Contact Form",
					subject: body.subject,
					name: body.name,
					email: body.email,
					message: body.message,
					botcheck: body.botcheck,
				},
			}),
		}),
	}),
})

export const { useSendContactMessageMutation } = contactApi
