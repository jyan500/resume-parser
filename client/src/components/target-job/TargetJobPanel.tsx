import React, { useMemo, useState } from "react";
import { useForm, FormProvider, Controller, useFormContext } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../store";
import { useTailorResumeMutation } from "../../api/public/resume";
import type { Resume, SuggestedBullet } from "../../types/resume";
import {
    setSuggestions,
    dismissSuggestion,
    updateBullet,
    setFocusedRegionId,
    setHoveredBulletId,
    setTargetJobViewMode,
    type ContainsBullets,
} from "../../slices/resumeSlice";
import { ErrorDisplay } from "../page-elements/ErrorDisplay";
import { AsyncSelect } from "../page-elements/AsyncSelect";
import type { OptionType } from "../../types/api";
import { JOB_TITLE_URL } from "../../helpers/urls";

interface TargetJobForm {
    jobTitleId: OptionType;
    jobDescription: string;
}

// ─── Panel root ───────────────────────────────────────────────────────────────

export const TargetJobPanel: React.FC = () => {
    const { resume, targetJobViewMode: view, suggestions } = useAppSelector((s) => s.resume);
    const dispatch = useAppDispatch()

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* Panel header */}
            <div className="flex-none flex items-center px-5 py-3.5 border-b border-slate-200 bg-white">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Target Job
                </h2>
            </div>

            {view === "form" ? (
                <FormView resume={resume}/>
            ) : (
                <SuggestionsView
                    suggestedBullets={suggestions.suggestedBullets}
                    recommendations={suggestions.recommendations}
                    resume={resume}
                    onRetarget={() => dispatch(setTargetJobViewMode("form"))}
                />
            )}
        </div>
    );
};

// ─── Form view ────────────────────────────────────────────────────────────────

interface FormViewProps {
    resume: Resume
}

const FormView: React.FC<FormViewProps> = ({
    resume
}) => {
    const [tailorResume, { isLoading, error }] = useTailorResumeMutation();
    const [preloadedValues, setPreloadedValues] = useState({
        jobTitleId: {label: "", value: ""},
        jobDescription: "",
    })

    const dispatch = useAppDispatch();
    const  
    {
        register,
        control,
        trigger,
        getValues,
        watch,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<TargetJobForm>({
        defaultValues: preloadedValues
    });

    const registerOptions = {
        jobTitleId: {
            validate: (value: OptionType) => {
                const jobDescription = getValues("jobDescription")
                if (!value && !jobDescription?.trim()) {
                    return "Please provide at least a job title or job description"
                }
                return true
            }
        },
        jobDescription: {
            validate: (value: string) => {
                const jobTitle = getValues("jobTitleId")
                if (!value?.trim() && !jobTitle) {
                    return "Please provide at least a job title or job description"
                }
                return true
            },
            // filling out job description clears out the job title
            onChange: () => trigger("jobTitleId")
        }
    }

    const onSubmit = async (data: TargetJobForm) => {
        try {
            const result = await tailorResume({
                resume,
                jobDescription: data.jobDescription,
                jobTitleId: data.jobTitleId.value,
            }).unwrap();
            dispatch(setSuggestions(result));
            dispatch(setTargetJobViewMode("suggestions"))
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
                <p className = "text-xs text-slate-600">Enter a job title to tailor your resume based on keywords that we've determined for the selected job title</p>
                <Controller
                    name={"jobTitleId"}
                    control={control}
                    rules={registerOptions.jobTitleId}
                    render={({ field: { onChange } }) => (
                        <AsyncSelect 
                            className = "text-xs"
                            endpoint={JOB_TITLE_URL} 
                            isError={!!errors.jobTitleId}
                            clearable={true}
                            urlParams={{}} 
                            onSelect={async (selectedOption: OptionType | null) => {
                                if (selectedOption){
                                    setValue("jobTitleId", selectedOption, {shouldValidate: true})
                                    trigger("jobDescription")
                                }
                            }}
                        />
                    )}
                />
            </div>

            {/* Job Description */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Job Description</label>
                <p className = "text-xs text-slate-600">Enter a job description to tailor your resume to a particular job description</p>
                <textarea
                    placeholder="Paste the job description here to get tailored suggestions..."
                    rows={10}
                    {...register("jobDescription", registerOptions.jobDescription)}
                    className={`w-full px-3 py-2 text-sm text-slate-800 bg-white border rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors duration-150 resize-none ${
                        errors.jobDescription
                            ? "border-red-400 focus:border-red-400 focus:ring-red-400"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                />
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
            {(errors.jobTitleId || errors.jobDescription) && (
                <p className="text-xs text-red-500">
                    {errors.jobTitleId?.message || errors.jobDescription?.message}
                </p>
            )}
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
    const [suggestedBulletsOpen, setSuggestedBulletsOpen] = useState(true)

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
        <div className="flex flex-col gap-4 py-6 overflow-y-auto">
            {/* Sub-header */}
            <div className = "flex flex-col gap-3 px-5">
                {
                    suggestedBullets.length > 0 ? 
                        <button
                            onClick={onRetarget}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Retarget
                        </button>
                    : null
                }
                {suggestedBullets.length > 0 && (
                    <>
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <button
                                onClick={() => setSuggestedBulletsOpen((v) => !v)}
                                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                            >
                                <span className="text-xs font-medium text-slate-600">
                                    Suggestions ({suggestedBullets.length})
                                </span>
                                <svg
                                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${suggestedBulletsOpen ? "rotate-0" : "-rotate-90"}`}
                                    fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>
                        </div>
                        <>
                            {suggestedBulletsOpen && (
                                <ul className="flex flex-col gap-y-2 h-[500px] overflow-y-auto">
                                    {
                                        suggestedBullets.map((sb, i) => (
                                            <SuggestionCard
                                                key={sb.id}
                                                index={i + 1}
                                                suggestedBullet={sb}
                                                onApply={() => handleApply(sb)}
                                                onDismiss={() => handleDismiss(sb)}
                                                onScrollTo={() => dispatch(setFocusedRegionId(sb.id))}
                                                onHover={() => dispatch(setHoveredBulletId(sb.id))}
                                                onHoverEnd={() => dispatch(setHoveredBulletId(null))}
                                            />
                                        ))
                                    }
                                </ul>
                                )
                            }
                        </>
                    </>
                    )}
            </div>

            <div className="flex flex-col gap-3 px-5">
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
    onScrollTo: () => void;
    onHover: () => void
    onHoverEnd: () => void
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
    index, suggestedBullet, onApply, onDismiss, onScrollTo, onHover, onHoverEnd,
}) => (
    <div 
        className="rounded-xl border border-slate-200 bg-white"
        onMouseEnter={onHover}
        onMouseLeave={onHoverEnd}
    >
        {/* Card header — clicking scrolls the editor to the matching bullet */}
        <button
            onClick={onScrollTo}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-colors text-left group"
            title="Click to locate bullet in editor"
        >
            <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                {index}
            </span>
            <p className="text-xs font-medium text-slate-600 truncate flex-1">
                Bullet suggestion
            </p>
            {/* Locate icon — appears on hover */}
            <svg
                className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0"
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
        </button>

        <div className="px-3.5 py-3 flex flex-col gap-3">
            {/* Original */}
            <div>
                <p className="text-xs font-medium text-slate-400 mb-1">Original</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                    {suggestedBullet.text}
                </p>
            </div>

            {/* Suggested */}
            <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Tips</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                    {suggestedBullet.recommendation}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {/* <button
                    onClick={onApply}
                    className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium transition-colors"
                >
                    Apply
                </button> */}
                <button
                    onClick={onDismiss}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 text-xs font-medium transition-colors"
                >
                    Got it
                </button>
            </div>
        </div>
    </div>
);
