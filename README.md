# CVSquared

Resume editor that accepts PDF or DOCX, extracts every section into structured fields and displays a live editor with a PDF preview. Users can paste a job title and description to identify missing keywords and align their experience bullet points to the job description. Lastly, users can export as PDF when they're done editing.

## Tech Stack

**Frontend** (`client/`)
- Next.js 16 + React 18 + TypeScript
- Tailwind CSS v4
- Redux Toolkit + redux-persist (state persisted to localStorage)
- RTK Query for API calls
- `@react-pdf/renderer` + `react-pdf` for PDF preview and export
- `@dnd-kit` for drag-and-drop section reordering
- `react-hook-form`, `react-select` / `react-select-async-paginate`
- Vitest + React Testing Library
- Deployed to Cloudflare Pages via `@cloudflare/next-on-pages`

**Backend** (`server/`)
- Flask + Flask-CORS + Flask-Limiter
- `pdfplumber`, `pdfminer.six`, `docx2txt`, `python-docx` for resume extraction
- `google-genai` (Gemini) / OpenAI clients for tailoring
- pytest for the test suite

## Running Locally

### Prerequisites
- Node.js 18+
- Python 3.11+
- MySQL (for the backend's job-titles store)

### Frontend
```bash
cd client
npm install
npm run dev
```
The app runs at http://localhost:3000.

Create `.env` in `client/` with the following:
```
NEXT_PUBLIC_API_URL = http://localhost:5000
```

Other useful scripts:
```bash
npm run build          # production build
npm run start          # serve the production build
npm run lint           # ESLint
npm test -- --run      # run the Vitest suite once
```

### Backend
```bash
cd server
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
```

Create a `.env` in `server/` with your LLM credentials (Gemini / OpenAI).
```
GEMINI_API_KEY = <INSERT Gemini API Key here>
OPENAI_API_KEY = <Insert OPEN AI API Key>
SECRET_KEY = <application secret key>
```

```bash
python app.py
```
The API runs at http://localhost:5000.

Run the backend tests:
```bash
venv\Scripts\pytest tests/ -v
```
