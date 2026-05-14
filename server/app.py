import traceback
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.errors import RateLimitExceeded
from flask_limiter.util import get_remote_address
import os
import sys
import io
from utils.tailor import TailorResume
from utils.parser import ResumeParser
from utils.keywords import KeywordExtractor
import humps
import json
from utils.validation import validate_tailor_request, validate_missing_keywords_request
from utils.turnstile import require_turnstile
from utils.leniency import DEFAULT_LENIENCY
from utils.routes import ( PARSE_RESUME_URL, TAILOR_RESUME_URL, MISSING_KEYWORDS_URL, JOB_TITLE_URL )

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")
app.config["GEMINI_API_KEY"] = os.environ.get("GEMINI_API_KEY")
app.config["OPENROUTER_BASE_URL"] = os.environ.get("OPENROUTER_BASE_URL")
app.config["OPENROUTER_API_KEY"] = os.environ.get("OPENROUTER_API_KEY")
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
CORS(app, origins=allowed_origins)

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=[],
    storage_uri="memory://",
)

@app.errorhandler(RateLimitExceeded)
def handle_rate_limit(e):
    return jsonify({"status": 429, "errors": ["Too many requests. Please try again later."]}), 429

# Replace stdout with an unbuffered version (skip under pytest to avoid capture conflicts)
if "pytest" not in sys.modules:
    sys.stdout = io.TextIOWrapper(
        sys.stdout.buffer, encoding='utf-8', line_buffering=True
    )

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MOCKS_FOLDER'] = 'mocks'
MOCK_RESUME = os.path.join(app.config["MOCKS_FOLDER"], "sample_resume_germany.json")
parser = ResumeParser()
tailor = TailorResume()
keyword_extractor = KeywordExtractor()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

@app.route(PARSE_RESUME_URL, methods=['POST'])
@limiter.limit("5 per minute")
@require_turnstile
def parse_resume():
    # Handle file upload
    if 'resume' not in request.files:
        return jsonify({"status": 422, "errors": ["No resume file provided"]}), 422
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({"status": 422, "errors": ["No file selected"]}), 422
    
    # Save file temporarily
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    resume_data = {}
    
    try:
        # Parse the resume
        resume_data = parser.parse_resume(filepath)

    except ValueError as e:
        return jsonify({"status": 422, "errors": [str(e)]}), 422
    except Exception as e:
        return jsonify({"status": 500, "errors": ["Something went wrong!"]}), 500
    finally:
        # Clean up file
        os.remove(filepath)
        
    return jsonify(resume_data)


@app.route(TAILOR_RESUME_URL, methods=['POST'])
@limiter.limit("5 per minute")
@require_turnstile
@validate_tailor_request
def tailor_resume():
    data = request.json

    resume = data.get("resume")
    job_description = data.get("jobDescription")
    job_title = data.get("jobTitle")
    missing_keywords = data.get("missingKeywords", [])

    # we only include the experience and projects
    # as this is what the LLM will give feedback on
    experience = resume.get("experience", [])
    projects = resume.get("projects", [])

    suggestions = {}
    try:
        # only include the resume's experience and projects section
        resume_json = json.dumps({"experience": experience, "projects": projects})
        # retrieve the prompt version (strict, variants, full)
        version = data.get("promptVersion", DEFAULT_LENIENCY)
        suggestions = tailor.tailor_resume(
            resume_json,
            job_description,
            job_title,
            missing_keywords=missing_keywords,
            version=version,
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"status": 500, "errors": ["Something went wrong!"]}), 500

    return jsonify(humps.camelize(suggestions))


@app.route(MISSING_KEYWORDS_URL, methods=['POST'])
@limiter.limit("5 per minute")
@require_turnstile
@validate_missing_keywords_request
def missing_keywords():
    data = request.json
    resume = data.get("resume") or {}
    job_description = data.get("jobDescription")
    job_title = data.get("jobTitle")

    try:
        keywords = keyword_extractor.get_missing_keywords(job_title, job_description, resume)
    except Exception:
        traceback.print_exc()
        return jsonify({"status": 500, "errors": ["Something went wrong!"]}), 500

    return jsonify(humps.camelize({"keywords": keywords}))

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug, port=port, host="0.0.0.0")

