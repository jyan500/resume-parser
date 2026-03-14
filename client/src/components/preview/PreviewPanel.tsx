import React, { useCallback, useEffect, useState } from "react";
import { usePDF } from "@react-pdf/renderer";
/* 
Note the react-pdf imports below belongs to the library wojtekmaj/react-pdf, which is
different from @react-pdf/renderer
*/
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { ResumeDocument } from "./ResumeDocument";
import { useAppSelector, selectResume, selectVisibility } from "../../store";

/* 
    Sets up a PDF within a web worker (a separate browser thread) 
    so the parsing work does not cause lag within the UI 
*/
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

export const PreviewPanel: React.FC = () => {
    const resume = useAppSelector(selectResume);
    const visibility = useAppSelector(selectVisibility);

    /* usePDF hook exposes the lifecycle for the PDF render from react-pdf/renderer*/
    const [instance, updateInstance] = usePDF({
        document: <ResumeDocument resume={resume} visibility={visibility} />,
    });

    useEffect(() => {
        updateInstance(<ResumeDocument resume={resume} visibility={visibility} />);
    }, [resume, visibility]); // eslint-disable-line react-hooks/exhaustive-deps

    // The last blob URL that successfully finished rendering.
    // While a new render is in-flight, this stays visible so there's
    // never a blank or black frame between updates.
    const [previousUrl, setPreviousUrl] = useState<string | null>(null);

    const [numPages, setNumPages] = useState(1);
    const [containerWidth, setContainerWidth] = useState(0);
    /* Make sure PDF always fills the size of its container with the resize observer*/
    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;
        const observer = new ResizeObserver(([entry]) =>
            setContainerWidth(entry.contentRect.width)
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const handleDownload = useCallback(() => {
        if (!instance.url) return;
        const a = document.createElement("a");
        a.href = instance.url;
        a.download = `${resume.header.name || "resume"}.pdf`;
        a.click();
    }, [instance.url, resume.header.name]);

    const isFirstRender = previousUrl === null;
    const isNewUrlReady = instance.url !== null;
    const isBusy = instance.loading || instance.url !== previousUrl;

    // Show the previous document while the new one is rendering behind it.
    const showPreviousDocument = !isFirstRender && isBusy && previousUrl !== null;

    const pageWidth = containerWidth > 48 ? containerWidth - 48 : containerWidth;

    return (
        <div className="flex flex-col h-full">

            {/* Toolbar */}
            <div className="flex-none flex items-center justify-end gap-2 px-4 py-2.5 bg-white border-b border-slate-200">
                <button
                    onClick={handleDownload}
                    disabled={!instance.url}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors duration-150"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export PDF
                </button>
            </div>

            {/* Viewer */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto bg-slate-700 relative"
            >
                {/* First-load message — only shown before any render has completed */}
                {isFirstRender && instance.loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-sm text-slate-400">Rendering PDF…</p>
                    </div>
                )}

                {containerWidth > 0 && (
                    <div className="relative flex flex-col items-center py-6 gap-4">

                        {/*
                            Previous document — stays fully visible while the next
                            render is in flight. Fades slightly to hint at the update.
                        */}
                        {showPreviousDocument && (
                            <Document
                                key={previousUrl}
                                file={previousUrl}
                                loading={null}
                                className="flex flex-col items-center gap-4"
                            >
                                {Array.from({ length: numPages }, (_, i) => (
                                    <Page
                                        key={i + 1}
                                        pageNumber={i + 1}
                                        width={pageWidth}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className="shadow-2xl opacity-80 transition-opacity duration-300"
                                        loading={null}
                                    />
                                ))}
                            </Document>
                        )}

                        {/*
                            Incoming document — renders invisibly (position:absolute,
                            opacity-0) until onRenderSuccess fires, at which point
                            setPreviousUrl promotes it to the visible slot above and
                            this one takes over as the new visible document.
                        */}
                        {isNewUrlReady && (
                            <Document
                                key={instance.url}
                                file={instance.url}
                                loading={null}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                className={`flex flex-col items-center gap-4 ${
                                    showPreviousDocument
                                        ? "absolute top-6 opacity-0 pointer-events-none"
                                        : ""
                                }`}
                            >
                                {Array.from({ length: numPages }, (_, i) => (
                                    <Page
                                        key={i + 1}
                                        pageNumber={i + 1}
                                        width={pageWidth}
                                        renderTextLayer={true}
                                        renderAnnotationLayer={true}
                                        className="shadow-2xl"
                                        loading={null}
                                        onRenderSuccess={
                                            // Only the last page firing promotes the URL,
                                            // so multi-page resumes don't swap mid-render.
                                            i + 1 === numPages
                                                ? () => setPreviousUrl(instance.url)
                                                : undefined
                                        }
                                    />
                                ))}
                            </Document>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
};