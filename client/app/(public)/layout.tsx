import { Header } from "../_components/Header"
import { Footer } from "../_components/Footer"

export default function PublicLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<div className="flex-1">{children}</div>
			<Footer />
		</div>
	)
}
