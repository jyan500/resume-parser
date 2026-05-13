"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Group, Panel } from "react-resizable-panels";
import { PreviewPanel } from "./preview/PreviewPanel";
import { useAppSelector, selectParseStatus } from "../_lib/store";
import { EditorPanel } from "./editor/EditorPanel";
import { TargetJobPanel } from "./target-job/TargetJobPanel";
import { XL_BREAKPOINT } from "../_lib/constants"
import { ResizeHandle } from "./page-elements/ResizeHandle"
import { useWindowSize } from "../_lib/hooks/useWindowSize";
import type { MobilePane } from "../_lib/types/resume";
import { Header } from "./Header"
import { UPLOAD_PAGE } from "../_lib/routes"

export const EditorView: React.FC = () => {
	const router = useRouter();
	const parseStatus = useAppSelector(selectParseStatus);
	const { width } = useWindowSize();
	const isMobile = width < XL_BREAKPOINT;
	const [activePane, setActivePane] = useState<MobilePane>("editor");

	// Guard: if someone navigates directly to /editor without a parsed resume,
	// send them back to the upload page.
	useEffect(() => {
		if (parseStatus !== "success") {
			router.replace(UPLOAD_PAGE);
		}
	}, [parseStatus, router]);

	if (parseStatus !== "success") return null;

	const tabConfig: { key: MobilePane; label: string }[] = [
		{ key: "editor", label: "Editor" },
		{ key: "preview", label: "Preview" },
		{ key: "targetJob", label: "Target Job" },
	];

	return (
		<div className="h-screen flex flex-col bg-slate-50 overflow-hidden">

			{/* Topbar */}
			<Header/>

			{isMobile ? (
				<div className="flex flex-col flex-1 overflow-hidden">

					{/* Tab bar */}
					<div className="flex-none flex bg-white border-b border-slate-200">
						{tabConfig.map(({ key, label }) => (
							<button
								key={key}
								onClick={() => setActivePane(key)}
								className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-150 ${
									activePane === key
										? "text-brand-accent border-b-2 border-brand-accent"
										: "text-slate-500 hover:text-slate-700"
								}`}
							>
								{label}
							</button>
						))}
					</div>

					{/* Active pane */}
					<div className="flex-1 overflow-hidden">
						{activePane === "editor" && (
							<div className="flex flex-col h-full bg-white overflow-hidden">
								<div className="flex-1 overflow-y-auto px-5 py-4">
									<div className="px-4 py-4">
										<EditorPanel />
									</div>
								</div>
							</div>
						)}
						{activePane === "preview" && (
							<div className="flex flex-col h-full bg-slate-100 overflow-hidden">
								<div className="flex-1 overflow-hidden">
									<PreviewPanel />
								</div>
							</div>
						)}
						{activePane === "targetJob" && (
							<div className="flex flex-col h-full overflow-hidden">
								<TargetJobPanel />
							</div>
						)}
					</div>

				</div>
			) : (
				/* Split-pane body */
				<Group orientation="horizontal" className="flex-1 overflow-hidden">

					{/* Left — editor panel */}
					<Panel defaultSize={"30%"} minSize={"25%"} maxSize={"36%"} className="flex flex-col bg-white overflow-hidden">
						<div className="flex-none flex items-center px-5 py-3.5 border-b border-slate-100">
							<h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
								Editor
							</h2>
						</div>
						<div className="flex-1 overflow-y-auto px-5 py-4">
							<div className="px-4 py-4">
								<EditorPanel/>
							</div>
						</div>
					</Panel>

					<ResizeHandle />

					{/* Center — live PDF preview */}
					<Panel minSize={"20%"} className="flex flex-col bg-slate-100 overflow-hidden">
						<div className="flex-none flex items-center px-5 py-3.5 border-b border-slate-200 bg-white">
							<h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
								Preview
							</h2>
						</div>
						<div className="flex-1 overflow-hidden">
							<PreviewPanel />
						</div>
					</Panel>

					<ResizeHandle />

					{/* Far right — target job panel */}
					<Panel defaultSize={"20%"} minSize={"14%"} maxSize={"25%"} className="flex flex-col overflow-hidden">
						<TargetJobPanel />
					</Panel>

				</Group>
			)}
		</div>
	);
};

export default EditorView;
