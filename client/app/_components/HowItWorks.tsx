import React from "react";

const steps = [
	{
		title: "Upload Resume",
		description:
			"Drag and drop or click to upload your PDF or DOCX resume. We extract every section automatically.",
	},
	{
		title: "AI Analyzes & Parses",
		description:
			"Our AI structures your resume into ATS-friendly fields and gives you a live, editable PDF preview so you can refine every detail.",
	},
	{
		title: "Tailor to Any Job",
		description:
			"Paste a job title and description to receive AI-powered suggestions that align your experience with what the employer is looking for.",
	},
	{
		title: "Export Your Resume",
		description:
			"When you're satisfied, download your polished, optimized resume as a clean PDF ready to submit.",
	},
];

const demos = [
	{
		src: "/step1-export.png",
		alt: "Before and after view of a resume parsed into an ATS-friendly layout",
		caption: "Parsed and reformatted into a clean, ATS-friendly layout.",
	},
	{
		src: "/step2-export.png",
		alt: "The CVSquared editor with live preview and AI tailoring suggestions",
		caption: "Edit every section and apply AI tailoring suggestions in the live editor.",
	},
];

export const HowItWorks: React.FC = () => (
	<section id="how-it-works" className="bg-white" style={{ paddingTop: 96, paddingBottom: 112 }}>
		<div style={{ maxWidth: 1100, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }}>
			{/* Section heading */}
			<div className="flex flex-col items-center text-center" style={{ marginBottom: 64 }}>
				<h2
					className="font-bold text-brand-dark"
					style={{ fontSize: 38, letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0, maxWidth: 560 }}
				>
					How it{" "}
					<span className="text-brand-accent">works</span>
				</h2>
			</div>

			{/* Steps — horizontal row on desktop, stacked on mobile */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 32 }}>
				{steps.map((step) => (
					<div key={step.title} className="flex flex-col" style={{ gap: 14 }}>
						<h3
							className="font-bold text-brand-dark"
							style={{ fontSize: 18, letterSpacing: "-0.015em", lineHeight: 1.3, margin: 0 }}
						>
							{step.title}
						</h3>
						<p
							className="text-brand-muted"
							style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0 }}
						>
							{step.description}
						</p>
					</div>
				))}
			</div>

			{/* Demo screenshots */}
			<div className="flex flex-col gap-8 mt-16">
				{demos.map((demo) => (
					<figure
						key={demo.src}
						className="bg-white border border-brand-border rounded-xl p-3 m-0"
						style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
					>
						<img
							src={demo.src}
							alt={demo.alt}
							className="block w-full h-auto rounded-lg"
						/>
						<figcaption
							className="text-brand-muted text-center leading-normal mt-3"
							style={{ fontSize: 13.5 }}
						>
							{demo.caption}
						</figcaption>
					</figure>
				))}
			</div>
		</div>
	</section>
);
