import React, { useCallback } from "react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import { ResumeDocument } from "./ResumeDocument";
import { useAppSelector, selectResume, selectVisibility } from "../../store";

export const PreviewPanel: React.FC = () => {
    const resume = useAppSelector(selectResume);
    const visibility = useAppSelector(selectVisibility);

    const handleDownload = useCallback(async () => {
        const blob = await pdf(
            <ResumeDocument resume={resume} visibility={visibility} />
        ).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${resume.header.name || "resume"}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    }, [resume, visibility]);

    return (
        <div className="flex flex-col h-full">

            {/* Toolbar */}
            <div className="flex-none flex items-center justify-end gap-2 px-4 py-2.5 bg-white border-b border-slate-200">
                <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium transition-colors duration-150"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export PDF
                </button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden">
                {/*
                    PDFViewer re-renders on every resume/visibility change.
                    Not SSR-compatible — use next/dynamic with ssr: false if moving to Next.js.
                */}
                <PDFViewer width="100%" height="100%" showToolbar={false}>
                    <ResumeDocument resume={resume} visibility={visibility} />
                </PDFViewer>
            </div>

        </div>
    );
};