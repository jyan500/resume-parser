import traceback
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import io
from utils.tailor import TailorResume
from utils.parser import ResumeParser
import humps
import json
from utils.validation import validate_tailor_request
from utils.routes import ( PARSE_RESUME_URL, TAILOR_RESUME_URL, JOB_TITLE_URL )

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")
app.config["GEMINI_API_KEY"] = os.environ.get("GEMINI_API_KEY")
app.config["OPENROUTER_BASE_URL"] = os.environ.get("OPENROUTER_BASE_URL")
app.config["OPENROUTER_API_KEY"] = os.environ.get("OPENROUTER_API_KEY")
CORS(app)  # Allow frontend to make requests

# Replace stdout with an unbuffered version
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

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

@app.route(PARSE_RESUME_URL, methods=['POST'])
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
@validate_tailor_request
def tailor_resume():
    data = request.json

    resume = data.get("resume")
    job_description = data.get("jobDescription")
    job_title = data.get("jobTitle")

    # we only include the experience and projects
    # as this is what the LLM will give feedback on
    experience = resume.get("experience", [])
    projects = resume.get("projects", [])

    suggestions = {}
    try:
        # only include the resume's experience and projects section
        resume_json = json.dumps({"experience": experience, "projects": projects})
        suggestions = tailor.tailor_resume(resume_json, job_description, job_title)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"status": 500, "errors": ["Something went wrong!"]}), 500

    return jsonify(humps.camelize(suggestions))

if __name__ == '__main__':
    app.run(debug=True, port=5000)

