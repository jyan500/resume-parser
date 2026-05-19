import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./_components/Providers"
import { ADSENSE_CLIENT } from "./_lib/constants"

const inter = Inter({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-inter",
	display: "swap",
})

export const metadata: Metadata = {
	metadataBase: process.env.NEXT_PUBLIC_SITE_URL
		? new URL(process.env.NEXT_PUBLIC_SITE_URL)
		: undefined,
	title: "CVSquared - Free Resume Parser & Job Tailoring Tool",
	description:
		"Upload a PDF or DOCX resume, edit every section in a structured editor, and tailor it to any job description in minutes. Private by default, never stored.",
	other: {
		"google-adsense-account": ADSENSE_CLIENT,
	},
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" className={inter.variable}>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
