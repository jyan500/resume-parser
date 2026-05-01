import React, { useMemo, useState } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../store";
import { useGetMissingKeywordsMutation, useTailorResumeMutation } from "../../api/public/resume";
import { useTurnstile } from "../../contexts/TurnstileContext";
import type { Keyword, Resume, SuggestedBullet, ToggleVisibility } from "../../types/resume";
import type { CustomError }  from "../../types/api"
import type { SerializedError } from "@reduxjs/toolkit"
import {
    setSuggestions,
    dismissSuggestion,
    dismissAllSuggestions,
    updateBullet,
    updateBullets,
    setFocusedRegionId,
    setHoveredBulletId,
    setTargetJobViewMode,
    toggleSectionCollapseVisibility,
    setSubToggleVisibility,
    type ContainsBullets,
    type TailorLeniency,
} from "../../slices/resumeSlice";
import { ErrorDisplay } from "../page-elements/ErrorDisplay";
import { Input } from "../page-elements/Input";
import { Button } from "../page-elements/Button";
import { Sparkles, RefreshCw, ChevronDown, Check, MapPin, CheckCheck } from "lucide-react";
import { TextArea } from "../page-elements/TextArea"

interface TargetJobForm {
    jobTitle: string;
    jobDescription: string;
    leniency: TailorLeniency;
}

// ─── Panel root ───────────────────────────────────────────────────────────────

export const TargetJobPanel: React.FC = () => {
    const { resume, targetJobViewMode: view, suggestions } = useAppSelector((s) => s.resume);
    const dispatch = useAppDispatch();
    const { resetToken } = useTurnstile();
    const [getMissingKeywords, { error: keywordsError }] = useGetMissingKeywordsMutation();
    const [tailorResume, { error: tailorError }] = useTailorResumeMutation();
    const [ isLoading, setIsLoading ] = useState(false)
    const error = keywordsError ?? tailorError;

    const methods = useForm<TargetJobForm>({
        defaultValues: { jobTitle: "", jobDescription: "", leniency: "variants" },
    });
    const leniency = methods.watch("leniency");

    const handleTailor = async (title: string, description: string, curLeniency: TailorLeniency) => {
        try {
            setIsLoading(true)
            const missingKeywords = await getMissingKeywords({
                resume,
                jobDescription: description,
                jobTitle: title,
            }).unwrap();
            const tailorResult = await tailorResume({
                resume,
                jobDescription: description,
                jobTitle: title,
                missingKeywords: missingKeywords.map(({ text, type }) => ({ text, type })),
                promptVersion: curLeniency,
            }).unwrap();
            dispatch(setSuggestions({ ...tailorResult, missingKeywords }));
            dispatch(setTargetJobViewMode("suggestions"));
            resetToken();
            setIsLoading(false)
        } catch (_) {
            // Error is surfaced by <ErrorDisplay />
        }
    };

    const handleRetarget = () => {
        dispatch(setHoveredBulletId(null));
        dispatch(setSuggestions({ missingKeywords: [], suggestedBullets: [], numSuggestions: 0 }));
        dispatch(setTargetJobViewMode("form"));
    };

    const handleTryAnotherJob = () => {
        methods.setValue("jobTitle", "");
        methods.setValue("jobDescription", "");
        handleRetarget();
    };

    const handleRerun = (newLeniency: TailorLeniency) => {
        methods.setValue("leniency", newLeniency);
        const { jobTitle, jobDescription } = methods.getValues();
        handleTailor(jobTitle, jobDescription, newLeniency);
    };

    const onSubmit = methods.handleSubmit((data) =>
        handleTailor(data.jobTitle, data.jobDescription, data.leniency)
    );


    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* Panel header */}
            <div className="flex-none flex items-center px-5 py-3.5 border-b border-slate-200 bg-white">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Target Job
                </h2>
            </div>

            <FormProvider {...methods}>
                {view === "form" ? (
                    <FormView
                        onFormSubmit={onSubmit}
                        isLoading={isLoading}
                        error={error}
                    />
                ) : (
                    <SuggestionsView
                        suggestedBullets={suggestions.suggestedBullets}
                        missingKeywords={suggestions.missingKeywords}
                        numSuggestions={suggestions.numSuggestions}
                        resume={resume}
                        leniency={leniency}
                        onRetarget={handleRetarget}
                        onTryAnotherJob={handleTryAnotherJob}
                        onRerun={handleRerun}
                        isLoading={isLoading}
                        error={error}
                    />
                )}
            </FormProvider>
        </div>
    );
};

// ─── Form view ────────────────────────────────────────────────────────────────

interface FormViewProps {
    onFormSubmit: (e?: React.BaseSyntheticEvent) => void;
    isLoading: boolean;
    error: SerializedError | CustomError | null | undefined;
}

const FormView: React.FC<FormViewProps> = ({ onFormSubmit, isLoading, error }) => {
    const { formState: { errors }, watch, setValue } = useFormContext<TargetJobForm>();
    const leniency = watch("leniency");

    const registerOptions = {
        jobTitle: {
            validate: (value: string) => {
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

    return (
        <form
            onSubmit={onFormSubmit}
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
                {errors.jobTitle?.message ? (
                    <p className="text-xs text-red-500">{errors.jobTitle.message}</p>
                ) : null}
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
                {errors.jobDescription?.message ? (
                    <p className="text-xs text-red-500">{errors.jobDescription.message}</p>
                ) : null}
            </div>

            {/* Keyword matching leniency */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Keyword matching</label>
                <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                    {([
                        { value: "strict",   label: "Conservative", sub: "Rephrasing only"  },
                        { value: "variants", label: "Balanced",      sub: "Adds keywords when fitting" },
                        { value: "full",     label: "Lenient",       sub: "Adds keywords freely" },
                    ] as { value: TailorLeniency; label: string; sub: string }[]).map(({ value, label, sub }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setValue("leniency", value)}
                            className={`flex flex-col items-center py-2 px-1 rounded-md text-center transition-colors ${
                                leniency === value
                                    ? "bg-white shadow-sm border border-slate-200 text-slate-800"
                                    : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <span className="text-xs font-medium leading-tight">{label}</span>
                            <span className="text-[10px] leading-tight mt-0.5">{sub}</span>
                        </button>
                    ))}
                </div>
            </div>

            <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isLoading}
                loadingText="Generating…"
                icon={<Sparkles className="w-4 h-4" strokeWidth={2} />}
                className="w-full"
            >
                Get Feedback
            </Button>
            <ErrorDisplay error={error} />
        </form>
    )
};

// ─── Suggestions view (Approach A) ───────────────────────────────────────────

interface SuggestionsViewProps {
    suggestedBullets: SuggestedBullet[];
    missingKeywords: Keyword[];
    numSuggestions: number;
    resume: Resume;
    leniency: TailorLeniency;
    onRetarget: () => void;
    onTryAnotherJob: () => void;
    onRerun: (leniency: TailorLeniency) => void;
    isLoading: boolean;
    error: SerializedError | CustomError | null | undefined;
}

const SuggestionsView: React.FC<SuggestionsViewProps> = ({
    suggestedBullets,
    numSuggestions,
    resume,
    leniency,
    onRetarget,
    onTryAnotherJob,
    onRerun,
    isLoading,
    error,
    missingKeywords,
}) => {
    const dispatch = useAppDispatch();
    const { regionToSection, subRegionToRegion, subToggleVisibility } = useAppSelector((state) => state.resume)
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

    const handleApplyAll = () => {
        // pull all suggested bullets 
        const bulletsToText = suggestedBullets.reduce((acc, obj) => {
            acc[obj.id] = obj.newText
            return acc
        }, {} as Record<string, string>)
        if (Object.keys(bulletsToText).length){
            dispatch(updateBullets({bulletsToText}))
            dispatch(dismissAllSuggestions())
        }
        dispatch(setHoveredBulletId(null))
    }

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
    const noSuggestions = numSuggestions === 0;

    const NO_SUGGESTIONS_COPY: Record<TailorLeniency, { body: string }> = {
        strict: {
            body: "Conservative mode only improves phrasing — it won't add keywords that aren't already in your resume. Try Balanced or Lenient to see keyword additions.",
        },
        variants: {
            body: "Your bullets may already use the right terminology for this role. Try Lenient to explore broader keyword additions.",
        },
        full: {
            body: "The AI had full flexibility but couldn't find meaningful improvements — your bullets may already be well-suited for this role.",
        },
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Analyzing your resume…</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 py-6 overflow-y-auto">
            {/* Sub-header */}
            <div className = "flex flex-col gap-3 px-5">
                <div className = "flex flex-row justify-between gap-3">
                    <button
                        onClick={onRetarget}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <RefreshCw className="w-3 h-3" strokeWidth={2.5} />
                        Retarget
                    </button>
                    {
                        suggestedBullets.length > 0 ? 
                            <button
                                onClick={handleApplyAll}
                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                            >
                                <CheckCheck className="w-3 h-3" strokeWidth={2.5} />
                                Apply all suggestions
                            </button>
                        : null
                    }
                </div>
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
                            onClick={onTryAnotherJob}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            <RefreshCw className="w-3 h-3" strokeWidth={2.5} />
                            Try another job
                        </button>
                    </div>
                )}

                {/* ── No suggestions state ── */}
                {noSuggestions && (
                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                        <div>
                            <p className="text-sm font-medium text-slate-700">No rewrites suggested at this setting.</p>
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                {NO_SUGGESTIONS_COPY[leniency].body}
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {leniency === "strict" && (
                                <>
                                    <button
                                        onClick={() => onRerun("variants")}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                                    >
                                        Try Balanced
                                    </button>
                                    <button
                                        onClick={() => onRerun("full")}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                                    >
                                        Try Lenient
                                    </button>
                                </>
                            )}
                            {leniency === "variants" && (
                                <button
                                    onClick={() => onRerun("full")}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                                >
                                    Try Lenient
                                </button>
                            )}
                            {leniency === "full" && (
                                <button
                                    onClick={onTryAnotherJob}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                                >
                                    <RefreshCw className="w-3 h-3" strokeWidth={2.5} />
                                    Try another job
                                </button>
                            )}
                        </div>
                    </div>
                )}
                <ErrorDisplay error={error} />

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
                                    <span>Recruiters look for these keywords in your <b>experience</b> bullets, listing them in a skills section is less impactful. Pills marked <span className="italic">in skills only</span> should be included into a bullet.</span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {missingKeywords.map((keyword) => {
                                        const colorClass = keyword.type === "Soft Skill"
                                            ? "border-amber-500 text-amber-600"
                                            : "border-brand-accent text-brand-accent";
                                        const borderStyle = keyword.inSkillsOnly ? "border-dashed" : "border-solid";
                                        const titleText = keyword.inSkillsOnly
                                            ? `${keyword.type} — in skills only`
                                            : keyword.type;
                                        return (
                                            <button
                                                key={keyword.id}
                                                title={titleText}
                                                className={`${colorClass} ${borderStyle} inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-white text-xs font-medium`}
                                            >
                                                {keyword.text}
                                                {keyword.inSkillsOnly && (
                                                    <span className="text-[10px] italic text-slate-400 font-normal">
                                                        in skills only
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
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
            className="hover:cursor-pointer w-full flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 hover:bg-brand-subtle hover:border-brand-border transition-colors text-left group"
            title="Click to locate bullet in editor"
        >
            <span className="w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                {index}
            </span>
            <p className="text-xs font-medium text-slate-600 truncate flex-1">
                Bullet suggestion
            </p>
            {/* Locate icon — appears on hover */}
            <MapPin
                className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-accent transition-colors flex-shrink-0"
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
            {/*     <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Tips</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                    {suggestedBullet.reasoning}
                </p>
            </div>*/}

            {/* Actions */}
            <div className="flex gap-2">
                <Button
                    variant="primary"
                    onClick={() => { onHoverEnd(); onApply() }}
                >
                    Apply
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => { onHoverEnd(); onDismiss() }}
                >
                    Dismiss
                </Button>
            </div>
        </div>
    </div>
);
