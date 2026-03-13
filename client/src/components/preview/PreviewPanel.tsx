import React, { useCallback, useEffect, useRef, useState } from "react";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import { ResumeDocument } from "./ResumeDocument";
import { useAppSelector, selectResume, selectVisibility } from "../../store";

// How long (ms) to keep the overlay visible after the PDF starts re-rendering.
// react-pdf typically finishes within 600–1 000 ms; 1 200 ms gives a safe buffer.
const RENDER_SETTLE_MS = 1200;

export const PreviewPanel: React.FC = () => {
    const resume = useAppSelector(selectResume);
    const visibility = useAppSelector(selectVisibility);

    // ── Loading overlay ───────────────────────────────────────────────────────
    // We track a stable "render token" — a number that bumps every time either
    // `resume` or `visibility` changes.  The overlay appears immediately on the
    // bump and disappears once the PDFViewer's inner <iframe> fires its `load`
    // event *or* the settle timeout elapses, whichever comes first.
    const [isRendering, setIsRendering] = useState(false);
    const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const iframeWrapperRef = useRef<HTMLDivElement>(null);

    // Skip the very first mount (nothing "changed"; the PDF just loaded).
    const mountedRef = useRef(false);

    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            return;
        }

        // Show overlay.
        setIsRendering(true);

        // Clear any previous settle timer.
        if (settleTimer.current) clearTimeout(settleTimer.current);

        // --- Strategy 1: listen for the iframe's load event ----------------
        // PDFViewer renders an <iframe> inside its wrapper div.  When react-pdf
        // finishes writing the new PDF into the iframe it triggers a `load`.
        let iframeCleanup: (() => void) | null = null;

        const attachIframeListener = () => {
            const iframe = iframeWrapperRef.current?.querySelector("iframe");
            if (!iframe) return;
            const onLoad = () => {
                if (settleTimer.current) clearTimeout(settleTimer.current);
                // Small trailing delay so the PDF paints before we remove the overlay.
                settleTimer.current = setTimeout(() => setIsRendering(false), 150);
            };
            iframe.addEventListener("load", onLoad);
            iframeCleanup = () => iframe.removeEventListener("load", onLoad);
        };

        // The iframe may not exist yet if this is the first render cycle —
        // try immediately, then fall back to a short rAF retry.
        attachIframeListener();
        const raf = requestAnimationFrame(attachIframeListener);

        // --- Strategy 2: hard timeout fallback -----------------------------
        // If for any reason the iframe load event doesn't fire (e.g. same-doc
        // reload quirk), remove the overlay after RENDER_SETTLE_MS anyway.
        settleTimer.current = setTimeout(() => {
            setIsRendering(false);
        }, RENDER_SETTLE_MS);

        return () => {
            if (settleTimer.current) clearTimeout(settleTimer.current);
            cancelAnimationFrame(raf);
            iframeCleanup?.();
        };
    }, [resume, visibility]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Download ──────────────────────────────────────────────────────────────
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

            {/* PDF Viewer + overlay wrapper */}
            <div ref={iframeWrapperRef} className="flex-1 overflow-hidden relative">

                {/*
                    PDFViewer re-renders on every resume/visibility change.
                    Not SSR-compatible — use next/dynamic with ssr: false if moving to Next.js.
                */}
                <PDFViewer width="100%" height="100%" showToolbar={false}>
                    <ResumeDocument resume={resume} visibility={visibility} />
                </PDFViewer>

                {/* Loading overlay — sits on top of the iframe while react-pdf re-renders */}
                <div
                    className={`
                        absolute inset-0 z-10 flex flex-col items-center justify-center
                        bg-white/90 backdrop-blur-[2px]
                        transition-opacity duration-300
                        ${isRendering ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                    `}
                    aria-hidden={!isRendering}
                >
                    {/* Spinner */}
                    <div className="relative w-9 h-9">
                        {/* Track ring */}
                        <svg
                            className="w-9 h-9 text-slate-200"
                            viewBox="0 0 36 36"
                            fill="none"
                        >
                            <circle cx="18" cy="18" r="15" stroke="currentColor" strokeWidth="3" />
                        </svg>
                        {/* Spinning arc */}
                        <svg
                            className="w-9 h-9 text-blue-600 absolute inset-0 animate-spin"
                            viewBox="0 0 36 36"
                            fill="none"
                            style={{ animationDuration: "0.75s" }}
                        >
                            <circle
                                cx="18"
                                cy="18"
                                r="15"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray="28 66"
                                strokeDashoffset="0"
                            />
                        </svg>
                    </div>
                    <p className="mt-3 text-xs font-medium text-slate-400 tracking-wide">
                        Updating preview…
                    </p>
                </div>
            </div>

        </div>
    );
};