import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "./_components/Header"
import { Footer } from "./_components/Footer"
import { UPLOAD_PAGE } from "./_lib/routes"

export const metadata: Metadata = {
	title: "Page Not Found | CVSquared",
	description: "The page you were looking for doesn't exist.",
}

export default function NotFound() {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<div className="flex-1">
				<main>
					<div
						style={{ maxWidth: 800, margin: "0 auto", padding: "56px 24px 72px" }}
						className="flex flex-col items-center text-center"
					>
						<span
							className="text-brand-accent font-bold"
							style={{ fontSize: 88, lineHeight: 1, letterSpacing: "-0.03em" }}
						>
							404
						</span>
						<h1
							className="text-brand-dark font-bold"
							style={{ fontSize: 32, marginTop: 16, marginBottom: 8 }}
						>
							Page not found
						</h1>
						<p
							className="text-slate-600"
							style={{ fontSize: 15, lineHeight: 1.75, maxWidth: 480, marginBottom: 28 }}
						>
							The page you&apos;re looking for doesn&apos;t exist or may have been moved.
							Let&apos;s get you back on track.
						</p>
						<Link
							href={UPLOAD_PAGE}
							className="bg-brand-accent hover:bg-brand-medium active:bg-brand-dark text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150"
						>
							Back to home
						</Link>
					</div>
				</main>
			</div>
			<Footer />
		</div>
	)
}
