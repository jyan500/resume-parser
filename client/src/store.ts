import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import resumeReducer from "./slices/resumeSlice";
import { publicApi } from "./api/public";

// ─── Store ────────────────────────────────────────────────────────────────────

export const store = configureStore({
    reducer: {
        resume: resumeReducer,
        // RTK Query manages its own slice of state under the reducerPath key
        [publicApi.reducerPath]: publicApi.reducer,
    },
    // resumeApi.middleware enables caching, invalidation, polling, and other
    // RTK Query features. It must be added here or they won't work.
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(publicApi.middleware),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ─── Typed Hooks ─────────────────────────────────────────────────────────────

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectResume = (state: RootState) => state.resume.resume;
export const selectHeader = (state: RootState) => state.resume.resume.header;
export const selectSummary = (state: RootState) => state.resume.resume.summary;
export const selectExperience = (state: RootState) => state.resume.resume.experience;
export const selectEducation = (state: RootState) => state.resume.resume.education;
export const selectSkills = (state: RootState) => state.resume.resume.skills;
export const selectProjects = (state: RootState) => state.resume.resume.projects;
export const selectVisibility = (state: RootState) => state.resume.visibility;
export const selectActiveSection = (state: RootState) => state.resume.activeSection;
export const selectParseStatus = (state: RootState) => state.resume.parseStatus;
export const selectParseError = (state: RootState) => state.resume.parseError;
export const selectIsDirty = (state: RootState) => state.resume.isDirty;