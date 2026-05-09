"use client"

import { useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { UPLOAD_PAGE, EDITOR_PAGE } from "../_lib/routes"
import { Logo } from "./Logo"

export const Header = () => {
	const router = useRouter()
	const pathname = usePathname()
	const isEditorPage = pathname === EDITOR_PAGE

	// TODO(step-4): once Redux is wired up, dispatch(resetResume()) and
	// await persistor.purge() before navigating, matching the Vite behavior.
	const handleBackToUpload = useCallback(() => {
		router.push(UPLOAD_PAGE)
	}, [router])

	return (
		<header
			className="flex-none flex items-center gap-x-2 border-b border-brand-border"
			style={{
				padding: `14px ${isEditorPage ? "20px" : "32px"}`,
				position: "relative",
				zIndex: 3,
			}}
		>
			{isEditorPage ? (
				<>
					<button
						onClick={handleBackToUpload}
						className="cursor-pointer flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors duration-150"
					>
						<ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
						Upload new
					</button>
					<span className="text-slate-200">|</span>
				</>
			) : null}
			<Link href={UPLOAD_PAGE} className="flex flex-row gap-x-2 items-center">
				<Logo />
			</Link>
		</header>
	)
}
