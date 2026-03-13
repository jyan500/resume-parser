import React from "react";
import { UploadPanel } from "../components/upload/UploadPanel";

export const UploadPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">

            {/* Topbar */}
            <header className="flex-none h-14 bg-white border-b border-slate-200 flex items-center px-6">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 tracking-tight">
                        ResumeAI
                    </span>
                </div>
            </header>

            {/* Upload panel centered in remaining space */}
            <div className="flex-1 flex items-center justify-center p-6">
                <UploadPanel />
            </div>

        </div>
    );
};
