import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../store";
import { useTailorResumeMutation } from "../../api/public/resume";
import type { Resume } from "../../types/resume";
import { ErrorDisplay } from "../page-elements/ErrorDisplay";

interface TargetJobForm {
    jobTitle: string;
    jobDescription: string;
    resume: Resume
}

export const TargetJobPanel: React.FC = () => {
    const [ tailorResume, { data, isLoading, error}] = useTailorResumeMutation()
    const { resume } = useAppSelector(state => state.resume) 
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TargetJobForm>();

    const onSubmit = async (data: TargetJobForm) => {
        try {
            await tailorResume({
                resume,
                jobDescription: data.jobDescription,
                jobTitle: data.jobTitle
            }).unwrap()
        }
        catch (e){

        }
    };

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">

            {/* Panel header — matches Editor/Preview headers */}
            <div className="flex-none flex items-center px-5 py-3.5 border-b border-slate-200 bg-white">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Target Job
                </h2>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5"
            >
                {/* Job Title */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-600">
                        Job Title
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Senior Software Engineer"
                        {...register("jobTitle", {
                            required: "Job title is required",
                        })}
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
                    <label className="text-xs font-medium text-slate-600">
                        Job Description
                    </label>
                    <textarea
                        placeholder="Paste the job description here to get tailored suggestions..."
                        rows={10}
                        {...register("jobDescription", {
                            required: "Job description is required",
                        })}
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
                {/* AI Generate button */}
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
                <ErrorDisplay error={error}/>
            </form>
        </div>
    );
};
