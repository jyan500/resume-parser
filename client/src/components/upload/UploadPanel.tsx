import React, { useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Check, ArrowDownToLine, AlertTriangle } from "lucide-react";
import type { CustomError } from "../../types/api";
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

    const errorMessage =
        (error as CustomError)?.errors ? [] :
        "Something went wrong. Please try again.";

    return (
        <div className="w-full max-w-lg">

            {/* Header */}
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 mb-4">
                    <FileText className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                    Upload your resume
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                    We'll parse it into an editable format in seconds
                </p>
            </div>

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
                        "relative rounded-2xl border-2 border-dashed px-8 py-12 text-center transition-all duration-200",
                        isDragOver
                            ? "border-blue-400 bg-blue-50 scale-[1.01]"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50",
                        isLoading ? "pointer-events-none opacity-60" : "",
                    ].join(" ")}
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-3">
                            <LoadingSpinner type={"div"} size={"w-10 h-10"}/>
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
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <Check className="w-5 h-5 text-blue-600" />
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
                                isDragOver ? "bg-blue-100" : "bg-slate-100",
                            ].join(" ")}>
                                <ArrowDownToLine
                                    className={[
                                        "w-5 h-5 transition-colors duration-200",
                                        isDragOver ? "text-blue-600" : "text-slate-400",
                                    ].join(" ")}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700">
                                    <span className="text-blue-600">Click to upload</span>
                                    {" "}or drag and drop
                                </p>
                                <p className="mt-0.5 text-xs text-slate-400">PDF or DOCX only</p>
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

            {/* Helper text */}
            <p className="mt-4 text-center text-xs text-slate-400">
                Your resume is processed securely and never stored permanently
            </p>

        </div>
    );
};
