import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Group, Panel, Separator } from "react-resizable-panels";
import { PreviewPanel } from "../components/preview/PreviewPanel";
import { persistor, useAppSelector, useAppDispatch, selectParseStatus } from "../store";
import { EditorPanel } from "../components/editor/EditorPanel";
import { TargetJobPanel } from "../components/target-job/TargetJobPanel";
import { resetResume } from "../slices/resumeSlice";
import { HOVER_Z_INDEX, LG_BREAKPOINT, XL_BREAKPOINT } from "../helpers/constants"
import { ResizeHandle } from "../components/page-elements/ResizeHandle"
import { ArrowLeft, FileText } from "lucide-react";
import { useWindowSize } from "../hooks/useWindowSize";
import type { MobilePane } from "../types/resume";
import { Header } from "../components/page-elements/Header"

export const EditorPage: React.FC = () => {
    const navigate = useNavigate();
    const parseStatus = useAppSelector(selectParseStatus);
    const dispatch = useAppDispatch();
    const { width } = useWindowSize();
    const isMobile = width < XL_BREAKPOINT;
    const [activePane, setActivePane] = useState<MobilePane>("editor");

    // Guard: if someone navigates directly to /editor without a parsed resume,
    // send them back to the upload page.
    useEffect(() => {
        if (parseStatus !== "success") {
            navigate("/", { replace: true });
        }
    }, [parseStatus, navigate]);

    // Reset in-memory Redux state, flush & purge the localStorage persistence,
    // then navigate back. Awaiting purge ensures the key is removed before the
    // upload page mounts and checks the store.
    const handleBackToUpload = useCallback(async () => {
        dispatch(resetResume());
        await persistor.purge();
        navigate("/");
    }, [dispatch, navigate]);

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
