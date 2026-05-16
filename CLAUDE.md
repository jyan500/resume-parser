# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Resume-parser is a Next.js (App Router) / React / TypeScript application for parsing and editing resumes. Users can upload resumes, edit them in a WYSIWYG editor, and generate formatted PDF outputs. The frontend lives in `client/` and is deployed to Cloudflare Pages via `@cloudflare/next-on-pages`.

## Development Commands

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Starts the Next.js development server at http://localhost:3000

### Production Build
```bash
npm run build
```
Runs `next build` to compile and build the application for production

### Cloudflare Pages Build & Preview
```bash
npm run pages:build      # build with @cloudflare/next-on-pages
npm run pages:preview    # preview the Cloudflare Pages output locally via wrangler
```

### Linting
```bash
npm run lint
```
Runs ESLint (`eslint-config-next`) on TypeScript and TypeScript React files

## Code Architecture

### File Structure
- `client/app/` - Next.js App Router source
  - `layout.tsx` - Root layout (metadata, fonts, Providers)
  - `page.tsx` - Home / resume upload route (`/`)
  - `editor/page.tsx` - Resume editing route (`/editor`)
  - `(public)/` - Route group for static pages (`privacy-policy`, `terms-of-service`)
  - `sitemap.ts` / `robots.ts` - Generate `/sitemap.xml` and `/robots.txt`
  - `globals.css` - Global styles, Tailwind import, brand color tokens
  - `_components/` - Reusable UI components (underscore = private, not routable)
    - `editor/` - Resume editing components (sections, fields, etc.)
    - `page-elements/` - Shared UI elements (buttons, inputs, selects)
    - `preview/` - Resume preview components
    - `target-job/` - Target job panel components
  - `_lib/` - Non-component application code
    - `store.ts` - Redux store configuration with persistence
    - `slices/resumeSlice.ts` - Redux slice for resume state management
    - `api/` - API service definitions (RTK Query)
    - `hooks/` - Custom React hooks
    - `types/` - TypeScript type definitions
    - `functions.ts` / `constants.ts` - Utility functions and constants

### State Management
- Uses Redux Toolkit with `redux-persist` for persisting resume data to localStorage
- Only the `resume` slice is persisted; RTK Query cache is not persisted
- Custom typed hooks: `useAppDispatch` and `useAppSelector`
- Resume state includes sections: header, summary, experience, education, certifications, skills, projects
- Additional UI state: visibility toggles, active section, parse status, dirty flag

### Routing
- Uses the Next.js App Router (file-system based routing under `client/app/`):
  - `/` - `app/page.tsx` (resume upload)
  - `/editor` - `app/editor/page.tsx` (resume editing)
  - `/privacy-policy`, `/terms-of-service` - static pages in the `(public)` route group
- Components are marked `"use client"` where they rely on client-only APIs (Redux, hooks, browser APIs)

### Styling
- TailwindCSS v4 via `@tailwindcss/postcss` (configured in `client/postcss.config.mjs`)
- Brand color palette is defined in `client/app/globals.css` — prefer these over generic Tailwind colors when styling new elements:
  - `bg-brand-bg` / `border-brand-border` — light green tints for backgrounds and borders
  - `text-brand-subtle` — muted green for secondary text
  - `text-brand-muted` — medium green for interactive/accent text
  - `text-brand-accent` / `text-brand-medium` — stronger greens for highlights
  - `bg-brand-dark` — dark green for footer and heavy backgrounds

### Key Dependencies
- `@dnd-kit/*` - Drag and drop functionality for reordering resume sections
- `@react-pdf/renderer` & `react-pdf` - PDF generation capabilities
- `react-hook-form` - Form handling in editor components
- `react-select` & `react-select-async-paginate` - Enhanced select components
- `uuid` - Unique ID generation
- `redux-persist` - State persistence to localStorage

## Common Development Tasks

### Adding a New Resume Section
1. Create component in `app/_components/editor/` (e.g., `NewSection.tsx`)
2. Add section type to `app/_lib/types/resume.ts`
3. Add reducer cases in `app/_lib/slices/resumeSlice.ts`
4. Import and use in `app/_components/editor/EditorPanel.tsx`
5. Add preview component in `app/_components/preview/` if needed
6. Update types in `app/_lib/types/api.ts` if API interaction needed

### Modifying Styling
- Use Tailwind utility classes directly in JSX
- For component-specific styles, consider creating CSS modules or using style props
- Global styles and brand tokens live in `app/globals.css`

### API Integration
- API services are defined in `app/_lib/api/` using RTK Query
- Base query configuration in `app/_lib/api/baseQuery.ts`
- Endpoints defined in feature-specific files (e.g., `app/_lib/api/resume.ts`)
- Store integration happens automatically in `app/_lib/store.ts`

### Testing
- Vitest + React Testing Library is configured in `client/`
- **After any change to frontend source files, run the test suite and confirm it passes before considering the task complete:**
  ```bash
  cd client && npm test -- --run
  ```
- Test files live alongside source files: `*.test.ts` / `*.test.tsx`
- Coverage areas: Redux slice reducers (`resumeSlice.test.ts`), custom hooks (`useCommit.test.ts`), utility functions (`functions.test.ts`)
- PDF/preview components are intentionally excluded — `@react-pdf/renderer` does not render to the DOM

## Backend Testing

The backend has a pytest suite under `server/tests/`. Run it after any change to files under `server/`:

```bash
cd server
venv/Scripts/pytest tests/ -v
```

**Always run the backend test suite as a verification step after modifying any file under `server/`.** All 91 tests must pass before considering a backend change complete.

## Backend Server

The project includes a Flask backend (`server/`) that handles resume parsing and tailoring.

### Server Commands

#### Installation
```bash
cd server
pip install -r requirements.txt
```

#### Running the Server
```bash
cd server
python app.py
```
Starts the Flask server at http://localhost:5000

### Server Architecture

- `app.py` - Main Flask application with routes for parsing, tailoring, and job titles
- `db/models.py` - SQLAlchemy models (JobTitle)
- `utils/parser.py` - Resume parsing logic (PDF/DOCX extraction)
- `utils/tailor.py` - Resume tailoring using LLM (Gemini/OpenRouter)
- `utils/routes.py` - Route URL constants
- `utils/validation.py` - Request validation
- `utils/functions.py` - Utility functions
- `utils/constants.py` - Constants
- `utils/client.py` - LLM client configuration

### Server Dependencies
- Flask with Flask-CORS
- SQLAlchemy with Flask-Migrate for database
- pdfplumber, pdfminer.six, docx2txt for resume parsing
- google-genai for Gemini API integration
- MySQL database for job titles

### API Endpoints
- `POST /parse-resume` - Upload and parse a resume file
- `POST /tailor-resume` - Tailor resume to job description or job title
- `GET /job-titles` - Search job titles (paginated)

## Best Practices
- Follow existing TypeScript interfaces in `app/_lib/types/`
- Keep components small and focused
- Use custom hooks for reusable logic (see `app/_lib/hooks/`)
- Leverage Redux Toolkit's createSlice for state management
- Use RTK Query for data fetching and caching
- Maintain accessibility standards in UI components
- Keep PDF generation considerations in mind when styling components

## TypeScript Import Style
- When importing **only** types from a module, use `import type { Foo } from "..."`.
- When importing both values and types from the same module, use inline `type` modifiers: `import { someValue, type SomeType } from "..."`.
- Never mix plain type imports with value imports in a single `import` statement without the `type` keyword on each type.

## Code Style
- **Indentation: tabs.** Each indent level is a single tab character (rendered at 4-wide). Applies to `.ts`, `.tsx`, `.js`, `.mjs`, `.css`, `.json`, and any other source files generated or edited going forward. Do not mix spaces and tabs within a file.