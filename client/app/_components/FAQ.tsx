"use client"

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
	{
		question: "What is CVSquared?",
		answer:
			<div>
				<p>CVSquared is an AI-powered resume optimization tool.</p>
				<ul className="list-disc pl-5">
					<li>Offers an editable PDF preview with live updates, such as changing text, section ordering and showing/hiding sections.</li>
					<li>Analyzes your resume against a job description and returns concise, actionable suggestions.</li>
					<li>Exports your updated resume in PDF format.</li>
				</ul>
			</div>,
	},
	{
		question: "What makes CVSquared unique from other AI resume writing tools?",
		answer: <ul className="list-disc pl-5">
			<li>CVSquared's AI processing is trained to provide tailored feedback that uses natural-sounding language, emphasizes business impact and is accurate to your own experience.</li>
			<li>Our editable PDF preview allows users to accept suggestions and re-word them to their preference if needed before they export it.</li>
		</ul>
	},
	{
		question: "What file formats do you support?",
		answer:
			<div>
				<p>We currently support both PDF and DOCX file uploads.</p>
			</div>,
	},
	{
		question: "Do I need an account to begin?",
		answer:
			<div>
				<p>No account is necessary! Just upload your resume to get started. </p>
			</div>,
	},
	{
		question: "Where is my information being sent?",
		answer:
			<ul className="list-disc pl-5">
				<li>During analysis, files are transmitted over encrypted connections and processed in real time by third‑party AI providers.</li>
				<li>We <span className="font-semibold">do not permanently store resume files</span>, but third parties may retain or use submitted data per their policies.</li>
				<li className="font-semibold">Avoid submitting highly sensitive information.</li>
			</ul>
	},
	{
		question: "What happens to my data after I'm done?",
		answer:
			<div>
				<p>
					All data is kept local to your browser. Once the browser tab is closed, all data will disappear.
				</p>
			</div>
	},
	{
		question: "I'm having trouble with the site. Who should I contact?",
		answer:
			<div>
				<p>
					Please contact us at {" "}
					<a href="mailto:jysoftware.strategies@gmail.com" className="text-brand-accent" style={{ textDecoration: "none" }}>
						jysoftware.strategies@gmail.com
					</a>
				</p>
			</div>
	}
];

const FAQItem: React.FC<{ question: string; answer: React.ReactNode }> = ({ question, answer }) => {
	const [open, setOpen] = useState(false);

	return (
		<div className="border border-brand-border rounded-xl overflow-hidden">
			<button
				onClick={() => setOpen((o) => !o)}
				className="w-full flex items-center justify-between bg-white hover:bg-brand-bg transition-colors text-left"
				style={{ padding: "18px 20px", gap: 16 }}
				aria-expanded={open}
			>
				<span className="font-semibold text-brand-dark" style={{ fontSize: 15 }}>
					{question}
				</span>
				<ChevronDown
					size={18}
					className="text-brand-muted flex-shrink-0 transition-transform duration-200"
					style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
					strokeWidth={2}
				/>
			</button>
			{open && (
				<div
					className="bg-white border-t border-brand-border text-brand-muted"
					style={{ padding: "16px 20px", fontSize: 14.5, lineHeight: 1.65 }}
				>
					{answer}
				</div>
			)}
		</div>
	);
};

export const FAQ: React.FC = () => (
	<section className="bg-brand-bg" style={{ paddingTop: 96, paddingBottom: 112 }}>
		<div style={{ maxWidth: 780, margin: "0 auto", paddingLeft: 24, paddingRight: 24 }}>
			{/* Section heading */}
			<div className="flex flex-col items-center text-center" style={{ marginBottom: 56 }}>
				<h2
					className="font-bold text-brand-dark"
					style={{ fontSize: 38, letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0 }}
				>
					Frequently asked{" "}
					<span className="text-brand-accent">questions</span>
				</h2>
			</div>

			{/* Items */}
			<div className="flex flex-col" style={{ gap: 10 }}>
				{faqs.map((faq) => (
					<FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
				))}
			</div>
		</div>
	</section>
);
