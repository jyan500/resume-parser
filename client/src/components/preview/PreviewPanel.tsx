/* 
    The two document render strategy was found within:
    https://github.com/diegomura/react-pdf-site/blob/master/src/components/Repl/PDFViewer.js
*/
import React, { useRef, useCallback, useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
/* 
Note the react-pdf imports below belongs to the library wojtekmaj/react-pdf, which is
different from @react-pdf/renderer
*/
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "../../styles/pdf-override.css"
import { ResumeDocument } from "./ResumeDocument";
import { useAppSelector, selectResume, selectVisibility, selectOrder, useAppDispatch } from "../../store";
import { useAsync } from "react-use"
import { ORDERS, setTemplate, setFocusedRegionId } from "../../slices/resumeSlice"
import type { ResumeTemplate } from "../../types/resume";
import type { OptionType } from "../../types/api"
import { Checkbox } from "../page-elements/Checkbox";
import { Select } from "../page-elements/Select"

/* 
    Sets up a PDF within a web worker (a separate browser thread) 
    so the parsing work does not cause lag within the UI 
*/
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

export const PreviewPanel: React.FC = () => {
    const dispatch = useAppDispatch()
    const {resume, visibility, order, template, hoveredBulletId} = useAppSelector((state) => state.resume)
    const [ form, setForm ] = useState({
        template: template,
        resetOrder: false,
    })

    const resumePdfDocument = <ResumeDocument template={template} order={order} resume={resume} visibility={visibility} />;
    const render = useAsync(async () => {
        const blob = await pdf(resumePdfDocument).toBlob();
        return URL.createObjectURL(blob);
    }, [resume, visibility, order, template]); 
 
    // Revoke old blob URLs to prevent memory leaks.
    const previousBlobRef = useRef<string | null>(null);
    useEffect(() => {
        if (!render.value) return;
        if (previousBlobRef.current && previousBlobRef.current !== render.value) {
            URL.revokeObjectURL(previousBlobRef.current);
        }
        previousBlobRef.current = render.value;
    }, [render.value]);
 
    // Revoke the final blob URL on unmount.
    useEffect(() => {
        return () => {
            if (previousBlobRef.current) URL.revokeObjectURL(previousBlobRef.current);
        };
    }, []);
 
    // Mirrors `previousRenderValue` from the original repo.
    const [previousRenderUrl, setPreviousRenderUrl] = useState<string | null>(null);
 
    const [numPages, setNumPages] = useState(1);
    const [containerWidth, setContainerWidth] = useState(0);

    const handleDownload = useCallback(() => {
        if (!render.value) return;
        const a = document.createElement("a");
        a.href = render.value;
        a.download = `${resume.header.name || "resume"}.pdf`;
        a.click();
    }, [render.value, resume.header.name]);

    const handleAnnotationLayerRendered = useCallback(() => {
        /* 
            find all link annotations and extract the region id, and transferring it to the section element's data-region-id instead,
            and remove the href and title to remove the default browser artifacts like the tooltips

            The request animation frame delays this code from running until the DOM is fully rendered, otherwise there will 
            be a timing issue where page 1 loads first, and it is parsed properly, but page 2 has not fully finished
            loading and as a result, it doesn't get parsed properly.
        */
        requestAnimationFrame(() => {
            document.querySelectorAll(".linkAnnotation").forEach((section) => {
                const anchor = section.querySelector<HTMLAnchorElement>("a");
                if (!anchor) return;

                const regionId = anchor.hash?.slice(1); // extracts "bullet-id" from "#bullet-id"
                if (regionId) (section as HTMLElement).dataset.regionId = regionId;

                anchor.removeAttribute("href");
                anchor.removeAttribute("title");
            });
        })
    }, [])

    /* 
        handle the clicks to retrieve the region id 
        focus the specific region within the right editor pane 
    */
    const handleViewerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const regionId = (e.target as HTMLElement)
            .closest<HTMLElement>(".linkAnnotation[data-region-id]")
            ?.dataset.regionId;
        if (regionId) dispatch(setFocusedRegionId(regionId));
    }, [dispatch]);

    // when hovered bullet id is not null,
    // locate the section which has the bullet id as the data-region-id and emit mouseover on that element
    useEffect(() => {
        // Clear any previously highlighted section
        document.querySelectorAll(".linkAnnotation.is-hovered").forEach((el) => {
            el.classList.remove("is-hovered");
        });
    
        // Apply to the newly hovered section
        if (hoveredBulletId) {
            document.querySelector(
                `.linkAnnotation[data-region-id="${hoveredBulletId}"]`
            )?.classList.add("is-hovered");
        }
    }, [hoveredBulletId]);
 
    // Mirrors the derived booleans from the original repo exactly.
    const isFirstRendering = previousRenderUrl === null;
    const isLatestValueRendered = previousRenderUrl === render.value;
    const isBusy = render.loading || !isLatestValueRendered;
 
    const shouldShowTextLoader = isFirstRendering && isBusy;
    const shouldShowPreviousDocument = !isFirstRendering && isBusy;
 
    const pageWidth = containerWidth > 48 ? containerWidth - 48 : containerWidth;

    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;
        const observer = new ResizeObserver(([entry]) =>
            setContainerWidth(entry.contentRect.width)
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const displayTemplate = (label: string) => {
        return label[0].toUpperCase() + label.slice(1)
    }

    return (
        <div className="flex flex-col h-full">

            {/* Toolbar */}
            <div className="flex-none flex items-center justify-between gap-2 px-4 py-2.5 bg-white border-b border-slate-200" data-theme="light">
                <div className = "flex flex-row gap-x-4 items-center">
                    <form className="flex flex-row gap-x-4 items-center">
                        <div className="flex flex-row gap-x-2 items-center">
                            <label htmlFor={"template-select"} className="text-xs font-medium text-slate-500">Switch Templates:</label>
                            <Select
                                id="template-select"
                                className="w-32 text-xs"
                                defaultValue={{ value: form.template, label: displayTemplate(form.template) }}
                                options={Object.keys(ORDERS).map((key) => ({
                                    value: key,
                                    label: displayTemplate(key),
                                }))}
                                hideIndicatorSeparator={true}
                                clearable={false}
                                onSelect={(selected: OptionType | null) => {
                                    if (selected) {
                                        setForm((prev) => ({ ...prev, template: selected.value as ResumeTemplate }))
                                        dispatch(setTemplate({
                                            template: selected.value as ResumeTemplate,
                                            resetOrder: form.resetOrder,
                                        }))
                                    }
                                }}
                            />
                        </div>
                        <div className="flex flex-row gap-x-2 items-center">
                            <label htmlFor={"template-order"} className="text-xs font-medium text-slate-500">Reset Order</label>
                            <Checkbox 
                                name={"template-order"}
                                enabled={form.resetOrder}
                                onToggle={(e) => {
                                    e.preventDefault()
                                    setForm({
                                        ...form,
                                        resetOrder: !form.resetOrder
                                    })
                                    dispatch(setTemplate({
                                        template: form.template,
                                        resetOrder: !form.resetOrder
                                    }))
                                }}
                            />
                        </div>
                    </form>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={!render.value}
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
                {shouldShowTextLoader && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-sm text-slate-400">Rendering PDF…</p>
                    </div>
                )}

                {containerWidth > 0 && (
                    <div onClick={handleViewerClick} className="relative flex flex-col items-center py-6 gap-4">

                        {/*
                            Previous document — stays fully visible while the next
                            render is in flight. Fades slightly to hint at the update.
                        */}
                        {shouldShowPreviousDocument && previousRenderUrl && (
                            <Document
                                key={previousRenderUrl}
                                file={previousRenderUrl}
                                loading={null}
                                className="flex flex-col items-center gap-4"
                            >
                                {Array.from({ length: numPages }, (_, i) => (
                                    <Page
                                        key={i + 1}
                                        pageNumber={i + 1}
                                        width={pageWidth}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={true}
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
                        {render.value && (
                            <Document
                                key={render.value}
                                file={render.value}
                                loading={null}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                className={`flex flex-col items-center gap-4 ${
                                    isBusy || shouldShowPreviousDocument
                                        ? "absolute top-6 opacity-0 pointer-events-none"
                                        : ""
                                }`}
                            >
                                {Array.from({ length: numPages }, (_, i) => (
                                    <Page
                                        key={i + 1}
                                        pageNumber={i + 1}
                                        width={pageWidth}
                                        // ── Highlight the hovered suggestion bullet ──
                                        renderAnnotationLayer={true}
                                        renderTextLayer={false}
                                        className="shadow-2xl"
                                        loading={null}
                                        onRenderAnnotationLayerSuccess={handleAnnotationLayerRendered}
                                        onRenderSuccess={
                                            // Only the last page firing promotes the URL,
                                            // so multi-page resumes don't swap mid-render.
                                            i + 1 === numPages
                                                ? () => setPreviousRenderUrl(render.value ?? null)
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
