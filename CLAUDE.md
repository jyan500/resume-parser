# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Resume-parser is a React/Vite/TypeScript application for parsing and editing resumes. Users can upload resumes, edit them in a WYSIWYG editor, and generate formatted PDF outputs.

## Development Commands

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Starts the Vite development server at http://localhost:5173

### Production Build
```bash
npm run build
```
Compiles TypeScript and builds the application for production

### Preview Production Build
```bash
npm run preview
```
Locally preview the production build

### Linting
```bash
npm run lint
```
Runs ESLint on TypeScript and TypeScript React files

## Code Architecture

### File Structure
- `client/src/` - Main application source
  - `components/` - Reusable UI components
    - `editor/` - Resume editing components (sections, fields, etc.)
    - `page-elements/` - Shared UI elements (buttons, inputs, selects)
    - `preview/` - Resume preview components
    - `upload/` - Upload panel components
    - `target-job/` - Target job panel components
  - `pages/` - Page-level components
    - `UploadPage.tsx` - Resume upload interface
    - `EditorPage.tsx` - Resume editing interface
  - `hooks/` - Custom React hooks
  - `store.ts` - Redux store configuration with persistence
  - `slices/resumeSlice.ts` - Redux slice for resume state management
  - `api/` - API service definitions (RTK Query)
  - `types/` - TypeScript type definitions
  - `helpers/` - Utility functions and constants
  - `styles/` - CSS overrides (mainly for PDF generation)

### State Management
- Uses Redux Toolkit with `redux-persist` for persisting resume data to localStorage
- Only the `resume` slice is persisted; RTK Query cache is not persisted
- Custom typed hooks: `useAppDispatch` and `useAppSelector`
- Resume state includes sections: header, summary, experience, education, certifications, skills, projects
- Additional UI state: visibility toggles, active section, parse status, dirty flag

### Routing
- Uses `react-router-dom` with two main routes:
  - `/` - UploadPage (resume upload)
  - `/editor` - EditorPage (resume editing)
  - Catch-all redirects unknown routes to home

### Styling
- TailwindCSS v4 via `@tailwindcss/vite` plugin
- DaisyUI component library for pre-built components
- Custom PDF styling in `src/styles/pdf-override.css`

### Key Dependencies
- `@dnd-kit/*` - Drag and drop functionality for reordering resume sections
- `@react-pdf/renderer` & `react-pdf` - PDF generation capabilities
- `react-hook-form` - Form handling in editor components
- `react-select` & `react-select-async-paginate` - Enhanced select components
- `uuid` - Unique ID generation
- `redux-persist` - State persistence to localStorage

## Common Development Tasks

### Adding a New Resume Section
1. Create component in `src/components/editor/` (e.g., `NewSection.tsx`)
2. Add section type to `src/types/resume.ts`
3. Add reducer cases in `src/slices/resumeSlice.ts`
4. Import and use in `src/components/editor/EditorPanel.tsx`
5. Add preview component in `src/components/preview/` if needed
6. Update types in `src/types/api.ts` if API interaction needed

### Modifying Styling
- Use Tailwind utility classes directly in JSX
- For component-specific styles, consider creating CSS modules or using style props
- PDF-specific overrides go in `src/styles/pdf-override.css`

### API Integration
- API services are defined in `src/api/` using RTK Query
- Base query configuration in `src/api/baseQuery.ts`
- Endpoints defined in feature-specific files (e.g., `src/api/public/resume.ts`)
- Store integration happens automatically in `store.ts`

### Testing
- Vitest + React Testing Library is configured in `client/`
- **After any change to frontend source files, run the test suite and confirm it passes before considering the task complete:**
  ```bash
  cd client && npm test -- --run
  ```
- Test files live alongside source files: `*.test.ts` / `*.test.tsx`
- Coverage areas: Redux slice reducers (`resumeSlice.test.ts`), custom hooks (`useCommit.test.ts`), utility functions (`functions.test.ts`)
- PDF/preview components are intentionally excluded — `@react-pdf/renderer` does not render to the DOM

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
- Follow existing TypeScript interfaces in `src/types/`
- Keep components small and focused
- Use custom hooks for reusable logic (see `src/hooks/`)
- Leverage Redux Toolkit's createSlice for state management
- Use RTK Query for data fetching and caching
- Maintain accessibility standards in UI components
- Keep PDF generation considerations in mind when styling components

## TypeScript Import Style
- When importing **only** types from a module, use `import type { Foo } from "..."`.
- When importing both values and types from the same module, use inline `type` modifiers: `import { someValue, type SomeType } from "..."`.
- Never mix plain type imports with value imports in a single `import` statement without the `type` keyword on each type.