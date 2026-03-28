import React, { useMemo, useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../store";
import { useTailorResumeMutation } from "../../api/public/resume";
import type { Resume, SuggestedBullet } from "../../types/resume";
import {
    setSuggestions,
    dismissSuggestion,
    updateBullet,
    type ContainsBullets,
} from "../../slices/resumeSlice";
import { ErrorDisplay } from "../page-elements/ErrorDisplay";

interface TargetJobForm {
    jobTitle: string;
    jobDescription: string;
}

// ─── Panel root ───────────────────────────────────────────────────────────────

export const TargetJobPanel: React.FC = () => {
    const { resume, suggestions } = useAppSelector((s) => s.resume);
    const [view, setView] = useState<"form" | "suggestions">("form");

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* Panel header */}
            <div className="flex-none flex items-center px-5 py-3.5 border-b border-slate-200 bg-white">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Target Job
                </h2>
            </div>

            {view === "form" ? (
                <FormView resume={resume} setView={setView}/>
            ) : (
                <SuggestionsView
                    suggestedBullets={suggestions.suggestedBullets}
                    recommendations={suggestions.recommendations}
                    resume={resume}
                    onRetarget={() => setView("form")}
                />
            )}
        </div>
    );
};

// ─── Form view ────────────────────────────────────────────────────────────────

interface FormViewProps {
    resume: Resume
    setView: (view: "form" | "suggestions") => void
}

const FormView: React.FC<FormViewProps> = ({
    resume, setView
}) => {
    const [tailorResume, { isLoading, error }] = useTailorResumeMutation();
    const dispatch = useAppDispatch();
    const  
    {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TargetJobForm>();

    const onSubmit = async (data: TargetJobForm) => {
        try {
            const result = await tailorResume({
                resume,
                jobDescription: data.jobDescription,
                jobTitle: data.jobTitle,
            }).unwrap();
            dispatch(setSuggestions(result));
            setView("suggestions");
        } catch (_) {
            // Error is surfaced by <ErrorDisplay />
        }
    };
    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5"
        >
            {/* Job Title */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Job Title</label>
                <input
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    {...register("jobTitle", { required: "Job title is required" })}
                    className={`w-full px-3 py-2 text-sm text-slate-800 bg-white border rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors duration-150 ${
                        errors.jobTitle
                            ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                />
                {errors.jobTitle && (
                    <p className="text-xs text-red-500">{errors.jobTitle.message}</p>
                )}
            </div>

            {/* Job Description */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Job Description</label>
                <textarea
                    placeholder="Paste the job description here to get tailored suggestions..."
                    rows={10}
                    {...register("jobDescription", { required: "Job description is required" })}
                    className={`w-full px-3 py-2 text-sm text-slate-800 bg-white border rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors duration-150 resize-none ${
                        errors.jobDescription
                            ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                />
                {errors.jobDescription && (
                    <p className="text-xs text-red-500">{errors.jobDescription.message}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors duration-150"
            >
                {isLoading ? (
                    <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Generating…
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                        </svg>
                        Get Feedback
                    </>
                )}
            </button>

            <ErrorDisplay error={error} />
        </form>
    )
};

// ─── Suggestions view (Approach A) ───────────────────────────────────────────

interface SuggestionsViewProps {
    suggestedBullets: SuggestedBullet[];
    recommendations: string[];
    resume: Resume;
    onRetarget: () => void;
}

const SuggestionsView: React.FC<SuggestionsViewProps> = ({
    suggestedBullets,
    recommendations,
    resume,
    onRetarget,
}) => {
    const dispatch = useAppDispatch();
    const [recommendationsOpen, setRecommendationsOpen] = useState(false);

    // Build a bulletId → { section, entryId } lookup so each card can dispatch
    // updateBullet without needing to know the resume structure.
    const bulletLocationMap = useMemo(() => {
        const map = new Map<string, { section: ContainsBullets; entryId: string }>();
        resume.experience.forEach((exp) =>
            exp.bullets.forEach((b) => map.set(b.id, { section: "experience", entryId: exp.id }))
        );
        (resume.projects ?? []).forEach((proj) =>
            proj.bullets.forEach((b) => map.set(b.id, { section: "projects", entryId: proj.id }))
        );
        return map;
    }, [resume]);

    const handleApply = (sb: SuggestedBullet) => {
        const loc = bulletLocationMap.get(sb.id);
        if (!loc) return;
        dispatch(updateBullet({ ...loc, bulletId: sb.id, text: sb.recommendation }));
        dispatch(dismissSuggestion(sb.id));
    };

    const handleDismiss = (sb: SuggestedBullet) => {
        dispatch(dismissSuggestion(sb.id));
    };

    const allDone = suggestedBullets.length === 0;

    return (
        <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Sub-header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-600">
                        {allDone
                            ? "All suggestions reviewed"
                            : `${suggestedBullets.length} suggestion${suggestedBullets.length !== 1 ? "s" : ""}`}
                    </span>
                </div>
                <button
                    onClick={onRetarget}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Retarget
                </button>
            </div>

            <div className="flex flex-col gap-3 px-5 py-4">
                {/* ── All done state ── */}
                {allDone && (
                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">All done!</p>
                            <p className="text-xs text-slate-400 mt-0.5">Your resume has been tailored.</p>
                        </div>
                        <button
                            onClick={onRetarget}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Try another job
                        </button>
                    </div>
                )}

                {/* ── Suggestion cards ── */}
                {suggestedBullets.map((sb, i) => (
                    <SuggestionCard
                        key={sb.id}
                        index={i + 1}
                        suggestedBullet={sb}
                        onApply={() => handleApply(sb)}
                        onDismiss={() => handleDismiss(sb)}
                    />
                ))}

                {/* ── General recommendations (collapsible) ── */}
                {recommendations.length > 0 && (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <button
                            onClick={() => setRecommendationsOpen((v) => !v)}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                            <span className="text-xs font-medium text-slate-600">
                                General recommendations ({recommendations.length})
                            </span>
                            <svg
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${recommendationsOpen ? "rotate-0" : "-rotate-90"}`}
                                fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>

                        {recommendationsOpen && (
                            <ul className="divide-y divide-slate-100">
                                {recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start gap-2.5 px-3.5 py-2.5">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                        <p className="text-xs text-slate-600 leading-relaxed">{rec}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Individual suggestion card ───────────────────────────────────────────────

interface SuggestionCardProps {
    index: number;
    suggestedBullet: SuggestedBullet;
    onApply: () => void;
    onDismiss: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
    index, suggestedBullet, onApply, onDismiss,
}) => (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                {index}
            </span>
            <p className="text-xs font-medium text-slate-600 truncate flex-1">
                Bullet suggestion
            </p>
        </div>

        <div className="px-3.5 py-3 flex flex-col gap-3">
            {/* Original */}
            <div>
                <p className="text-xs font-medium text-slate-400 mb-1">Original</p>
                <p className="text-xs text-slate-400 line-through leading-relaxed">
                    {suggestedBullet.text}
                </p>
            </div>

            {/* Suggested */}
            <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Suggested</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                    {suggestedBullet.recommendation}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onApply}
                    className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium transition-colors"
                >
                    Apply
                </button>
                <button
                    onClick={onDismiss}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 text-xs font-medium transition-colors"
                >
                    Dismiss
                </button>
            </div>
        </div>
    </div>
);
