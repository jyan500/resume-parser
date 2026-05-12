import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import {
	persistStore,
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from "redux-persist";
import { localStorage as storage, sessionStorage as storageSession } from "./persistStorage";
import resumeReducer from "./slices/resumeSlice";
import turnstileReducer from "./slices/turnstileSlice";
import { publicApi } from "./api/public";
import { listenerMiddleware } from "./listenerMiddleware";

// ─── Persist Config ───────────────────────────────────────────────────────────
// Only the `resume` slice is persisted. The RTK Query cache is intentionally
// excluded — it should always re-fetch fresh data on startup.

const resumePersistConfig = {
	key: "resume",
	version: 1,
	storage: process.env.NODE_ENV === "development" ? storage : storageSession,
};

const persistedResumeReducer = persistReducer(resumePersistConfig, resumeReducer);

// ─── Root Reducer ─────────────────────────────────────────────────────────────

const rootReducer = combineReducers({
	resume: persistedResumeReducer,
	turnstile: turnstileReducer,
	[publicApi.reducerPath]: publicApi.reducer,
});

// ─── Store ────────────────────────────────────────────────────────────────────

export const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			// redux-persist dispatches plain objects that aren't fully
			// serializable (e.g. FLUSH, REHYDRATE). Ignoring these specific
			// action types suppresses the RTK serialization warning.
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		})
			// prepend so listeners observe actions before publicApi.middleware processes them
			.prepend(listenerMiddleware.middleware)
			.concat(publicApi.middleware),
});

export const persistor = persistStore(store);

// ─── Types ────────────────────────────────────────────────────────────────────

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ─── Typed Hooks ──────────────────────────────────────────────────────────────

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectResume = (state: RootState) => state.resume.resume;
export const selectOrder = (state: RootState) => state.resume.order
export const selectHeader = (state: RootState) => state.resume.resume.header;
export const selectSummary = (state: RootState) => state.resume.resume.summary;
export const selectExperience = (state: RootState) => state.resume.resume.experience;
export const selectEducation = (state: RootState) => state.resume.resume.education;
export const selectCertifications = (state: RootState) => state.resume.resume.certifications;
export const selectSkills = (state: RootState) => state.resume.resume.skills;
export const selectProjects = (state: RootState) => state.resume.resume.projects;
export const selectVisibility = (state: RootState) => state.resume.visibility;
export const selectActiveSection = (state: RootState) => state.resume.activeSection;
export const selectParseStatus = (state: RootState) => state.resume.parseStatus;
export const selectParseError = (state: RootState) => state.resume.parseError;
export const selectIsDirty = (state: RootState) => state.resume.isDirty;
