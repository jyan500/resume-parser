import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PreviewPanel } from "../components/preview/PreviewPanel";
import { useAppSelector, selectParseStatus } from "../store";
import { EditorPanel } from "../components/editor/EditorPanel";

export const EditorPage: React.FC = () => {
    const navigate = useNavigate();
    const parseStatus = useAppSelector(selectParseStatus);

    // Guard: if someone navigates directly to /editor without a parsed resume,
    // send them back to the upload page.
    useEffect(() => {
        if (parseStatus !== "success") {
            navigate("/", { replace: true });
        }
    }, [parseStatus, navigate]);

    if (parseStatus !== "success") return null;

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">

            {/* Topbar */}
            <header className="flex-none h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
                <div className="flex items-center gap-3">
                    {/* Back to upload */}
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors duration-150"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Upload new
                    </button>

                    <span className="text-slate-200">|</span>

                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 tracking-tight">
                            ResumeAI
                        </span>
                    </div>
                </div>

                {/* Status pill */}
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Resume loaded
                </div>
            </header>

            {/* Split-pane body */}
            <main className="flex-1 flex overflow-hidden">

                {/* Left — editor panel */}
                <div className="w-[720px] flex-none flex flex-col border-r border-slate-200 bg-white overflow-hidden">
                    <div className="flex-none flex items-center px-5 py-3.5 border-b border-slate-100">
                        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            Editor
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-4">
                        {/* Editor section components go here */}
                        <div className="flex-1 overflow-y-auto px-4 py-4">
                            <EditorPanel/>
                        </div>
                    </div>
                </div>

                {/* Right — live PDF preview */}
                <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
                    <div className="flex-none flex items-center px-5 py-3.5 border-b border-slate-200 bg-white">
                        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            Preview
                        </h2>
                    </div>
                    <div className="flex-1 overflow-hidden p-6">
                        <div className="h-full rounded-xl overflow-hidden shadow-lg border border-slate-200">
                            <PreviewPanel />
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

