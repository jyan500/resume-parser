"use client"

import { CheckCircle2 } from "lucide-react"
import type { ResumeTemplate } from "../../_lib/types/resume"

export type TemplateBadgeTone = "muted" | "accent" | "amber"

export interface TemplateCardProps {
	template: ResumeTemplate
	label: string
	badge?: { text: string; tone: TemplateBadgeTone }
	description: string
	image: string
	selected: boolean
	onSelect: (template: ResumeTemplate) => void
}

const badgeToneClasses: Record<TemplateBadgeTone, string> = {
	muted: "bg-slate-100 text-slate-600",
	accent: "bg-brand-subtle text-brand-medium",
	amber: "bg-amber-100 text-amber-700",
}

export const TemplateCard = ({
	template,
	label,
	badge,
	description,
	image,
	selected,
	onSelect,
}: TemplateCardProps) => {
	const containerClasses = selected
		? "border-brand-accent bg-brand-bg"
		: "border-slate-200 bg-white hover:border-slate-300"

	return (
		<button
			type="button"
			onClick={() => onSelect(template)}
			aria-pressed={selected}
			className={`w-full text-left rounded-xl border ${containerClasses} transition-colors duration-150 cursor-pointer overflow-hidden`}
		>
			<div className="relative px-4 pt-4">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={image}
					alt={`${label} template preview`}
					className="w-full h-auto rounded-md border border-slate-200 bg-white"
				/>
				{selected && (
					<div className="absolute top-2 right-2 rounded-full bg-brand-accent text-white p-0.5 shadow">
						<CheckCircle2 className="w-6 h-6" strokeWidth={2} />
					</div>
				)}
			</div>

			<div className="px-4 py-3">
				<div className="flex items-center gap-x-2">
					<h3 className="text-sm font-semibold text-slate-800">{label}</h3>
					{badge && (
						<span className={`text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full ${badgeToneClasses[badge.tone]}`}>
							{badge.text}
						</span>
					)}
				</div>
				<p className="mt-1 text-xs text-slate-500 leading-relaxed">
					{description}
				</p>
				<p className={`mt-2 text-xs font-medium ${selected ? "text-brand-accent" : "text-slate-500"}`}>
					{selected ? "Selected" : "Use this template"}
				</p>
			</div>
		</button>
	)
}
