"use client"

import React from "react"
import { useAppDispatch, useAppSelector } from "../../_lib/store"
import { setLeftPaneMode, setTemplate } from "../../_lib/slices/resumeSlice"
import type { ResumeTemplate } from "../../_lib/types/resume"
import { TemplateCard, type TemplateBadgeTone } from "./TemplateCard"

interface TemplateOption {
	value: ResumeTemplate
	label: string
	badge?: { text: string; tone: TemplateBadgeTone }
	description: string
	image: string
}

const TEMPLATES: TemplateOption[] = [
	{
		value: "classic",
		label: "Classic",
		badge: { text: "Most popular", tone: "accent" },
		description: "No dividers. Generous spacing optimized for easy readability.",
		image: "/classic-preview.png",
	},
	{
		value: "modern",
		label: "Modern",
		badge: { text: "Space-saving", tone: "amber" },
		description: "Section dividers and tighter spacing, optimized to fit on one page.",
		image: "/modern-preview.png",
	},
	{
		value: "twoColumn",
		label: "Two-Column",
		description: "Sidebar layout that splits contact and skills from your experience.",
		image: "/twocolumn-preview.png",
	},
]

export const TemplatesPanel: React.FC = () => {
	const dispatch = useAppDispatch()
	const template = useAppSelector((state) => state.resume.template)

	const handleSelect = (next: ResumeTemplate) => {
		dispatch(setTemplate({ template: next, resetOrder: false }))
	}

	return (
		<div className="flex flex-col gap-y-3">

			<p className="text-xs text-slate-500 leading-relaxed">
				Choose a layout. Your content stays the same, only the look changes.
			</p>
			<div className="flex flex-col gap-y-3 mt-1">
				{TEMPLATES.map((tpl) => (
					<TemplateCard
						key={tpl.value}
						template={tpl.value}
						label={tpl.label}
						badge={tpl.badge}
						description={tpl.description}
						image={tpl.image}
						selected={template === tpl.value}
						onSelect={handleSelect}
					/>
				))}
			</div>
		</div>
	)
}
