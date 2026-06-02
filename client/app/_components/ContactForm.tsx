"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Input } from "./page-elements/Input"
import { TextArea } from "./page-elements/TextArea"
import { Button } from "./page-elements/Button"
import { useSendContactMessageMutation, type ContactMessageRequest } from "../_lib/api/contact"
import { Send, CheckCircle2 } from "lucide-react"

type ContactFormValues = ContactMessageRequest

const registerOptions = {
	name: {
		required: "Please enter your name",
		maxLength: { value: 120, message: "Name is too long" },
	},
	email: {
		required: "Please enter your email",
		pattern: {
			value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
			message: "Please enter a valid email address",
		},
	},
	subject: {
		required: "Please enter a subject",
		maxLength: { value: 200, message: "Subject is too long" },
	},
	message: {
		required: "Please enter a message",
		minLength: { value: 10, message: "Message should be at least 10 characters" },
		maxLength: { value: 5000, message: "Message is too long" },
	},
}

export const ContactForm: React.FC = () => {
	const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? ""
	const [sendContactMessage, { isLoading }] = useSendContactMessageMutation()
	const [submitted, setSubmitted] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string>("")

	const methods = useForm<ContactFormValues>({
		defaultValues: { name: "", email: "", subject: "", message: "", botcheck: "" },
	})

	const onSubmit = async (values: ContactFormValues) => {
		setErrorMessage("")
		try {
			const result = await sendContactMessage(values).unwrap()
			if (result.success) {
				setSubmitted(true)
				methods.reset()
			} else {
				setErrorMessage(result.message || "Something went wrong. Please try again.")
			}
		} catch (err) {
			const e = err as { errors?: string[] }
			setErrorMessage(e.errors?.[0] ?? "Network error. Please check your connection and try again.")
		}
	}

	if (submitted) {
		return (
			<div
				className="bg-brand-bg border border-2 border-brand-border rounded-xl flex flex-col items-center text-center"
				style={{ padding: "40px 24px", gap: 12 }}
			>
				<CheckCircle2 className="text-brand-accent" size={44} strokeWidth={1.75} />
				<h2 className="text-brand-dark font-semibold" style={{ fontSize: 20, margin: 0 }}>
					Thanks for reaching out!
				</h2>
				<p className="text-slate-600" style={{ fontSize: 14.5, lineHeight: 1.7, margin: 0, maxWidth: 420 }}>
					Your message has been sent. We&apos;ll get back to you at the email address you provided as soon
					as we can.
				</p>
				<button
					type="button"
					onClick={() => setSubmitted(false)}
					className="text-brand-accent hover:text-brand-medium font-medium"
					style={{ fontSize: 13.5, marginTop: 8, background: "none", border: "none", cursor: "pointer" }}
				>
					Send another message
				</button>
			</div>
		)
	}

	return (
		<FormProvider {...methods}>
			<form
				onSubmit={methods.handleSubmit(onSubmit)}
				className="bg-white border border-2 border-brand-border rounded-xl"
				style={{ padding: 28 }}
			>
				<div className="flex flex-col" style={{ gap: 18 }}>
					<div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
						<FormField label="Name" htmlFor="contact-name" error={methods.formState.errors.name?.message}>
							<Input
								id="contact-name"
								name="name"
								placeholder="Your name"
								registerOptions={registerOptions.name}
							/>
						</FormField>
						<FormField label="Email" htmlFor="contact-email" error={methods.formState.errors.email?.message}>
							<Input
								id="contact-email"
								name="email"
								type="email"
								placeholder="you@example.com"
								registerOptions={registerOptions.email}
							/>
						</FormField>
					</div>

					<FormField label="Subject" htmlFor="contact-subject" error={methods.formState.errors.subject?.message}>
						<Input
							id="contact-subject"
							name="subject"
							placeholder="What's this about?"
							registerOptions={registerOptions.subject}
						/>
					</FormField>

					<FormField label="Message" htmlFor="contact-message" error={methods.formState.errors.message?.message}>
						<TextArea
							name="message"
							placeholder="Tell us what's on your mind..."
							rows={6}
							registerOptions={registerOptions.message}
						/>
					</FormField>

					{/* Honeypot: bots fill it, humans don't. Web3Forms drops submissions where this is non-empty. */}
					<input
						type="checkbox"
						{...methods.register("botcheck")}
						style={{ display: "none" }}
						tabIndex={-1}
						autoComplete="off"
					/>

					{errorMessage && (
						<div
							className="border border-red-200 bg-red-50 text-red-700 rounded-lg"
							style={{ padding: "10px 14px", fontSize: 13.5 }}
						>
							{errorMessage}
						</div>
					)}

					<div className="flex items-center" style={{ marginTop: 4 }}>
						<Button
							type="submit"
							size="md"
							isLoading={isLoading}
							loadingText="Sending..."
							icon={<Send size={15} />}
							disabled={!accessKey}
						>
							Send Message
						</Button>
						{!accessKey && (
							<span className="text-red-600" style={{ fontSize: 12.5, marginLeft: 12 }}>
								Contact form is not configured. Please email us directly.
							</span>
						)}
					</div>
				</div>
			</form>
		</FormProvider>
	)
}

type FormFieldProps = {
	label: string
	htmlFor: string
	error?: string
	children: React.ReactNode
}

const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, error, children }) => (
	<div className="flex flex-col" style={{ gap: 6 }}>
		<label htmlFor={htmlFor} className="text-brand-dark font-medium" style={{ fontSize: 13 }}>
			{label}
		</label>
		{children}
		{error && (
			<span className="text-red-600" style={{ fontSize: 12 }}>
				{error}
			</span>
		)}
	</div>
)
