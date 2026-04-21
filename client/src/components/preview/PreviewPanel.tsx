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
import { ORDERS, setTemplate, setFocusedRegionId, toggleSectionCollapseVisibility, setSubToggleVisibility } from "../../slices/resumeSlice"
import type { ResumeTemplate, ToggleVisibility } from "../../types/resume";
import type { OptionType } from "../../types/api"
import { Checkbox } from "../page-elements/Checkbox";
import { Select } from "../page-elements/Select"
import { LoadingSpinner } from "../page-elements/LoadingSpinner";
import { Download } from "lucide-react";
import { FIXED_PDF_WIDTH } from "../../helpers/constants"

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
    const [ downloadLoading, setDownloadLoading ] = useState(false)
    const [ renderKey, setRenderKey ] = useState(0)
    const {resume, subRegionToRegion, subToggleVisibility, regionToSection, visibility, order, template, hoveredBulletId, sectionTitles} = useAppSelector((state) => state.resume)
    const [ form, setForm ] = useState({
        template: template,
        resetOrder: false,
    })

    const resumePdfDocument = <ResumeDocument interactive={true} template={template} order={order} resume={resume} visibility={visibility} sectionTitles={sectionTitles} />;
    const render = useAsync(async () => {
        const blob = await Promise.race([
            pdf(resumePdfDocument).toBlob(),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("PDF render timed out")), 15000)
            ),
        ]);
        return URL.createObjectURL(blob);
    }, [resume, visibility, order, template, sectionTitles, renderKey]);
 
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
    const hasInitialized = useRef(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const outerRef = useRef<HTMLDivElement>(null);

    const handleDownload = useCallback(async () => {
        const cleanDocument = (
            <ResumeDocument
                template={template}
                order={order}
                resume={resume}
                visibility={visibility}
                interactive={false}  // strips all link annotations
                sectionTitles={sectionTitles}
            />
        );
    
        const blob = await pdf(cleanDocument).toBlob();
        const url = URL.createObjectURL(blob);
    
        const a = document.createElement("a");
        a.href = url;
        a.download = `${resume.header.name ? resume.header.name.split(" ").join("_") + "_Resume" : "Resume"}.pdf`;
        a.click();
    
        // Clean up immediately after the click is dispatched
        URL.revokeObjectURL(url);
    }, [template, order, resume, visibility, sectionTitles]);

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

                // do not remove the href and title from actual urls
                if (regionId) {
                    (section as HTMLElement).dataset.regionId = regionId;
                    anchor.removeAttribute("href");
                    anchor.removeAttribute("title");
                }

            });
        })
    }, [])

    /* 
        handle the clicks to retrieve the region id 
        focus the specific region within the right editor pane 
    */
    const handleViewerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const regionId = (e.target as HTMLElement)
            .closest<HTMLElement>(".linkAnnotation[data-region-id]")
            ?.dataset.regionId;

        // TODO: need to make sure the region id is present in the DOM (not collapsed) before this method is called
        if (regionId) {
            // for experience and project sections with nested bullets,
            if (regionId in subRegionToRegion){
                const mainRegionId = subRegionToRegion[regionId]
                if (mainRegionId in subToggleVisibility){
                    dispatch(setSubToggleVisibility({regionId: mainRegionId, isOpen: true}))
                }
                // if the top level parent is collapsed, make sure it becomes visible
                if (mainRegionId in regionToSection){
                    const sectionKey: keyof ToggleVisibility = regionToSection[mainRegionId]
                    dispatch(toggleSectionCollapseVisibility({key: sectionKey, isOpen: true}))
                }
            }
            // for every section that is not projects and experiences (that have nested sections)
            else if (regionId in regionToSection){
                const sectionKey: keyof ToggleVisibility = regionToSection[regionId]
                dispatch(toggleSectionCollapseVisibility({key: sectionKey, isOpen: true}))
            }
            dispatch(setFocusedRegionId(regionId))
        }
    }

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
 
    const isFirstRendering = previousRenderUrl === null;
    const isLatestValueRendered = previousRenderUrl === render.value;
    // Exclude error state so a failed render doesn't permanently lock isBusy=true.
    const isBusy = (render.loading || !isLatestValueRendered) && !render.error;

    const shouldShowTextLoader = isFirstRendering && isBusy;
    // Also keep the previous document visible (as a stable fallback) when a re-render fails.
    const shouldShowPreviousDocument = !isFirstRendering && (isBusy || !!render.error);
    
    /* 
      Resize without re-rendering: the PDF canvas is fixed at FIXED_PDF_WIDTH (816px)
      and never changes, so react-pdf never redraws it on resize. Instead, CSS zoom
      is applied directly to the DOM to scale the visual output — no React state update,
      no canvas re-render, no flash.

      When the panel is wider than 816px: zoom = 1 (crisp, natural size), PDF centered.
      When narrower: zoom < 1 (scaled down), with MIN_SIDE_PADDING reserved on each side.

      Note the tradeoff here is that normally, text layer and annotation layer would go out
      of sync with each other since the PDF is not actually re-rendered to account for the size change,
      but since we're only displaying the annotation layer, the link annotation effects and clicking still works.
    */ 
    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;
        const observer = new ResizeObserver(([entry]) => {
            const availableWidth = entry.contentRect.width;
            if (availableWidth === 0) return;
            const MIN_SIDE_PADDING = 8;
            // When the panel is wider than the PDF, render at natural size (zoom=1) and
            // center it — no blur. When narrower, scale down and reserve MIN_SIDE_PADDING
            // on each side so the PDF never touches the container edges.
            const scale = availableWidth >= FIXED_PDF_WIDTH
                ? 1
                : (availableWidth - 2 * MIN_SIDE_PADDING) / FIXED_PDF_WIDTH;
            const sidePadding = (availableWidth - FIXED_PDF_WIDTH * scale) / 2;
            if (wrapperRef.current) {
                wrapperRef.current.style.zoom = String(scale);
                if (!hasInitialized.current) {
                    wrapperRef.current.style.visibility = '';
                    hasInitialized.current = true;
                }
            }
            if (outerRef.current) {
                outerRef.current.style.paddingLeft = `${sidePadding}px`;
                outerRef.current.style.paddingRight = `${sidePadding}px`;
            }
        });
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
                                menuInPortal={true}
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
                    onClick={async () => {
                        setDownloadLoading(true)
                        await handleDownload()
                        setDownloadLoading(false)
                    }}
                    disabled={!render.value}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors duration-150"
                >
                    {
                        !downloadLoading ? 
                            <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
                        : <LoadingSpinner/>
                    }
                    Export PDF
                </button>
            </div>

            {/* Viewer */}
            <div
                ref={containerRef}
                className={`${!isFirstRendering && !render.error ? "overflow-y-auto" : ""} relative`}
            >
                {shouldShowTextLoader && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-sm text-slate-400"><LoadingSpinner/></p>
                    </div>
                )}

                {isFirstRendering && render.error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 mt-6">
                        <p className="text-sm text-slate-500">Failed to generate PDF preview.</p>
                        <button
                            onClick={() => setRenderKey(k => k + 1)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors duration-150"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div ref={outerRef} className="py-6">
                    <div
                        ref={wrapperRef}
                        onClick={handleViewerClick}
                        className="relative flex flex-col items-center gap-4"
                        style={{ width: FIXED_PDF_WIDTH, visibility: 'hidden' }}
                    >

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
                                        width={FIXED_PDF_WIDTH}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={true}
                                        className={`shadow-2xl transition-opacity duration-300 ${render.error ? "" : "opacity-60"}`}
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
                                        width={FIXED_PDF_WIDTH}
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
                </div>
            </div>

        </div>
    );
};
