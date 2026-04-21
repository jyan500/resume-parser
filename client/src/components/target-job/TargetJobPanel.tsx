import React, { useMemo, useState } from "react";
import { useForm, FormProvider, Controller, useFormContext } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../store";
import { useTailorResumeMutation } from "../../api/public/resume";
import type { Keyword, Resume, SuggestedBullet, ToggleVisibility } from "../../types/resume";
import {
    setSuggestions,
    dismissSuggestion,
    updateBullet,
    setFocusedRegionId,
    setHoveredBulletId,
    setTargetJobViewMode,
    toggleSectionCollapseVisibility,
    setSubToggleVisibility,
    type ContainsBullets,
} from "../../slices/resumeSlice";
import { ErrorDisplay } from "../page-elements/ErrorDisplay";
import { AsyncSelect } from "../page-elements/AsyncSelect";
import { Input } from "../page-elements/Input";
import type { OptionType } from "../../types/api";
import { JOB_TITLE_URL } from "../../helpers/urls";
import { LoadingSpinner } from "../page-elements/LoadingSpinner";
import { Sparkles, RefreshCw, ChevronDown, Check, MapPin } from "lucide-react";
import { TextArea } from "../page-elements/TextArea"

interface TargetJobForm {
    jobTitle: OptionType;
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
                    missingKeywords={suggestions.missingKeywords}
                    recommendations={suggestions.recommendations}
                    numSuggestions={suggestions.numSuggestions}
                    resume={resume}
                    onRetarget={() => {
                        dispatch(setHoveredBulletId(null))
                        dispatch(setSuggestions({
                            missingKeywords: [], 
                            suggestedBullets: [],
                            recommendations: [],
                        }))
                        dispatch(setTargetJobViewMode("form"))
                    }}
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
        jobTitle: "",
        jobDescription: "",
    })

    const dispatch = useAppDispatch();
    const methods = useForm<TargetJobForm>({
        defaultValues: preloadedValues
    });
    const {
        register,
        control,
        trigger,
        getValues,
        watch,
        setValue,
        handleSubmit,
        formState: { errors },
    } = methods;

    const registerOptions = {
        jobTitle: {
            validate: (value: OptionType) => {
                if (!value && !value?.trim()) {
                    return "Please provide a job title"
                }
                return true
            }
        },
        jobDescription: {
            validate: (value: string) => {
                if (!value && !value?.trim()) {
                    return "Please provide a job description"
                }
                return true
            },
        }
    }

    const onSubmit = async (data: TargetJobForm) => {
        try {
            const result = await tailorResume({
                resume,
                jobDescription: data.jobDescription,
                jobTitle: data.jobTitle,
            }).unwrap();
            dispatch(setSuggestions(result));
            dispatch(setTargetJobViewMode("suggestions"))
        } catch (_) {
            // Error is surfaced by <ErrorDisplay />
        }
    };
    return (
        <FormProvider {...methods}>
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5"
        >
            {/* Job Title */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Job Title</label>
                <Input
                    placeholder={"Paste the job title here..."}
                    name="jobTitle"
                    registerOptions={registerOptions.jobTitle}
                />
                {
                    errors.jobTitle?.message ? 
                    <p className="text-xs text-red-500">
                        {errors.jobTitle?.message}
                    </p>
                    : null
                }
            </div>

            {/* Job Description */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Job Description</label>
                <TextArea
                    placeholder="Paste the job description here to get tailored suggestions..."
                    rows={10}
                    name={"jobDescription"}
                    registerOptions={registerOptions.jobDescription}
                />
                {
                    errors.jobDescription?.message ? 
                    <p className="text-xs text-red-500">
                        {errors.jobDescription?.message}
                    </p> : null
                }
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors duration-150"
            >
                {isLoading ? (
                    <>
                        <LoadingSpinner/>
                        Generating…
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4" strokeWidth={2} />
                        Get Feedback
                    </>
                )}
            </button>
            <ErrorDisplay error={error} />
        </form>
        </FormProvider>
    )
};

// ─── Suggestions view (Approach A) ───────────────────────────────────────────

interface SuggestionsViewProps {
    suggestedBullets: SuggestedBullet[];
    missingKeywords: Keyword[];
    recommendations: string[];
    numSuggestions: number;
    resume: Resume;
    onRetarget: () => void;
}

const SuggestionsView: React.FC<SuggestionsViewProps> = ({
    suggestedBullets,
    recommendations,
    numSuggestions,
    resume,
    onRetarget,
    missingKeywords,
}) => {
    const dispatch = useAppDispatch();
    const { regionToSection, subRegionToRegion, toggleVisibility, subToggleVisibility } = useAppSelector((state) => state.resume) 
    const [recommendationsOpen, setRecommendationsOpen] = useState(true);
    const [suggestedBulletsOpen, setSuggestedBulletsOpen] = useState(true)
    const [missingKeywordsOpen, setMissingKeywordsOpen] = useState(true)

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
        dispatch(updateBullet({ ...loc, bulletId: sb.id, text: sb.newText }));
        dispatch(dismissSuggestion(sb.id));
    };

    const handleDismiss = (sb: SuggestedBullet) => {
        dispatch(dismissSuggestion(sb.id));
    };

    const onScrollTo = (sb: SuggestedBullet) => {
        // check whether the sub section is open
        const regionId = sb.id
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
        dispatch(setFocusedRegionId(sb.id))
    }

    const allDone = numSuggestions > 0 && suggestedBullets.length === 0;

    return (
        <div className="flex flex-col gap-4 py-6 overflow-y-auto">
            {/* Sub-header */}
            <div className = "flex flex-col gap-3 px-5">
                {
                    <button
                        onClick={onRetarget}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors"
                    >
                        <RefreshCw className="w-3 h-3" strokeWidth={2.5} />
                        Retarget
                    </button>
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
                                <ChevronDown
                                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${suggestedBulletsOpen ? "rotate-0" : "-rotate-90"}`}
                                    strokeWidth={2.5}
                                />
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
                                                onScrollTo={() => onScrollTo(sb)}
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
                            <Check className="w-5 h-5 text-emerald-500" strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">All done!</p>
                            <p className="text-xs text-slate-400 mt-0.5">Your resume has been tailored.</p>
                        </div>
                        <button
                            onClick={onRetarget}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            <RefreshCw className="w-3 h-3" strokeWidth={2.5} />
                            Try another job
                        </button>
                    </div>
                )}

                {/* ── Missing Keywords ── */}
                {missingKeywords.length > 0 && (
                    <div className="rounded-xl border border-slate-200 overflow-hidden">
                        <button
                            onClick={() => setMissingKeywordsOpen((v) => !v)}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-600">
                                    Missing Keywords
                                </span>
                                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium leading-none">
                                    {missingKeywords.length}
                                </span>
                            </div>
                            <ChevronDown
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${missingKeywordsOpen ? "rotate-0" : "-rotate-90"}`}
                                strokeWidth={2.5}
                            />
                        </button>
 
                        {missingKeywordsOpen && (
                            <div className="px-3.5 py-3 flex flex-col gap-3">
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Add these keywords to your resume to improve your match score.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {missingKeywords.map((keyword) => (
                                        <button
                                            key={keyword.id}
                                            className={`
                                                ${keyword.type === "Soft Skill" ? "border-purple-500 text-purple-500" : "border-blue-500 text-blue-500"}
                                                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-white text-xs font-medium`
                                            }
                                        >
                                            {keyword.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
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
                            <ChevronDown
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${recommendationsOpen ? "rotate-0" : "-rotate-90"}`}
                                strokeWidth={2.5}
                            />
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
            <MapPin
                className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0"
                strokeWidth={2}
            />
        </button>

        <div className="px-3.5 py-3 flex flex-col gap-3">
            {/* Original */}
            <div>
                <p className="text-xs font-medium text-slate-400 mb-1">Original</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                    {suggestedBullet.text}
                </p>
            </div>

            <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Suggested</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                    {suggestedBullet.newText}
                </p>
            </div>

            {/* Suggested */}
            <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Tips</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                    {suggestedBullet.reasoning}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        onHoverEnd()
                        onApply()
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium transition-colors"
                >
                    Apply
                </button>
                <button
                    onClick={() => {
                        onHoverEnd()
                        onDismiss()
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 text-xs font-medium transition-colors"
                >
                    Dismiss
                </button>
            </div>
        </div>
    </div>
);
