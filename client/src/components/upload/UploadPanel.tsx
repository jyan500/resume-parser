import React, { useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowDownToLine, AlertTriangle } from "lucide-react";
import { useParseResumeMutation } from "../../api/public/resume";
import { useAppDispatch } from "../../store";
import { setResume, setParseStatus } from "../../slices/resumeSlice";
import { ErrorDisplay } from "../page-elements/ErrorDisplay";
import { LoadingSpinner } from "../page-elements/LoadingSpinner"

export const UploadPanel: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [parseResume, { isLoading, isError, error }] = useParseResumeMutation();
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = useCallback(
        async (file: File) => {
            const validTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
              ];
            if (!file || !validTypes.includes(file.type)) return;

            setFileName(file.name);
            dispatch(setParseStatus({ status: "parsing" }));

            try {
                const result = await parseResume(file).unwrap();
                dispatch(setResume(result.resume));
                dispatch(setParseStatus({ status: "success" }));
                // Navigate to the editor once parsing succeeds
                navigate("/editor");
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Failed to parse resume";
                dispatch(setParseStatus({ status: "error", error: message }));
                // reset to allow the upload of the same file in case it fails
                if (fileInputRef?.current){
                    fileInputRef.current.value = ""
                }
            }
        },
        [dispatch, navigate, parseResume]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    return (
        <div className="w-full">

            {/* Drop zone */}
            <label className="block cursor-pointer">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf, .docx, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="sr-only"
                    onChange={handleInputChange}
                    disabled={isLoading}
                />
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={[
                        "relative rounded-[18px] border-2 border-solid px-8 py-10 text-center transition-all duration-200",
                        isDragOver
                            ? "border-green-400 bg-green-50 scale-[1.01]"
                            : "border-brand-border bg-white hover:border-green-300 hover:bg-brand-bg",
                        isLoading ? "pointer-events-none opacity-60" : "",
                    ].join(" ")}
                    style={{
                        boxShadow: "0 30px 60px -30px rgba(22,163,74,0.28)",
                    }}
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-3">
                            <LoadingSpinner size="w-10 h-10" />
                            <div>
                                <p className="text-sm font-medium text-slate-700">
                                    Parsing resume...
                                </p>
                                {fileName && (
                                    <p className="mt-0.5 text-xs text-slate-400 truncate max-w-[220px] mx-auto">
                                        {fileName}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : fileName && !isError ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                <Check className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700">{fileName}</p>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    Click to choose a different file
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className={[
                                "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200",
                                isDragOver ? "bg-green-100" : "bg-green-50",
                            ].join(" ")}>
                                <ArrowDownToLine
                                    className={[
                                        "w-5 h-5 transition-colors duration-200",
                                        isDragOver ? "text-green-600" : "text-green-500",
                                    ].join(" ")}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700">
                                    <span className="text-brand-muted">Click to upload</span>
                                    {" "}or drag and drop
                                </p>
                                <p className="mt-0.5 text-xs text-slate-400">PDF or DOCX · up to 5MB</p>
                            </div>
                        </div>
                    )}
                </div>
            </label>

            {/* Error message */}
            {isError && (
                <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 border border-red-100">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <ErrorDisplay error={error}/>
                </div>
            )}


        </div>
    );
};
