import React from "react"
import type { Metadata } from "next"
import { Mail } from "lucide-react"
import { ContactForm } from "../../_components/ContactForm"

export const metadata: Metadata = {
	title: "Contact Us | CVSquared",
	description:
		"Get in touch with the CVSquared team.",
	alternates: { canonical: "/contact-us" },
}

export default function ContactUsPage() {
	return (
		<main>
			<div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 72px" }}>
				{/* Page heading */}
				<div style={{ marginBottom: 32, textAlign: "center" }}>
					<h1 className="text-brand-dark font-bold" style={{ fontSize: 32, marginBottom: 8 }}>
						Contact Us
					</h1>
					<p className="text-slate-600" style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
						Have a question, feedback, or a bug to report? Fill out the form below and we&apos;ll get
						back to you as soon as we can.
					</p>
				</div>

				{/* Form */}
				<ContactForm />

				{/* Fallback email */}
				<div
					className="flex items-center justify-center text-slate-500"
					style={{ marginTop: 28, gap: 8, fontSize: 13.5 }}
				>
					<Mail size={15} />
					<span>
						Prefer email? Reach us at{" "}
						<a
							href="mailto:jysoftware.strategies@gmail.com"
							className="text-brand-accent hover:text-brand-medium"
							style={{ textDecoration: "none" }}
						>
							jysoftware.strategies@gmail.com
						</a>
					</span>
				</div>
			</div>
		</main>
	)
}
