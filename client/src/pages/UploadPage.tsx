import React from "react";
import { UploadPanel } from "../components/upload/UploadPanel";
import { FileText } from "lucide-react";

export const UploadPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">

            {/* Topbar */}
            <header className="flex-none h-14 bg-white border-b border-slate-200 flex items-center px-6">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" strokeWidth={2.5} />
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

