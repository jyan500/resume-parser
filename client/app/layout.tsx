import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./_components/Providers"

const inter = Inter({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-inter",
	display: "swap",
})

export const metadata: Metadata = {
	title: "CVSquared",
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
