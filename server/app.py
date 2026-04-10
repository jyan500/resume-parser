import traceback
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import io
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import inspect as sa_inspect
from db.models import db, JobTitle
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

# load SQL
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql+pymysql://{os.getenv('MYSQL_USER')}:{os.getenv('MYSQL_PASSWORD')}"
    f"@{os.getenv('MYSQL_HOST')}:{os.getenv('MYSQL_PORT')}/{os.getenv('MYSQL_DB')}"
)

db.init_app(app)
migrate = Migrate(app, db, directory="db/migrations")

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

def camelize_response(data):
    return jsonify(humps.camelize(data))

def instance_to_dict(instance):
    """Mapped column values only (excludes relationships)."""
    # Get column-only keys to exclude any accidentally loaded relationships
    mapper = sa_inspect(instance.__class__)
    column_keys = {attr.key for attr in mapper.column_attrs}
    return {k: v for k, v in instance.__dict__.items() 
            if not k.startswith('_') and k in column_keys}


def paginated_json(pagination, serialize_item=None):
    """JSON-serializable pagination body, camelCased for the client."""
    serializer = serialize_item if serialize_item is not None else instance_to_dict
    items = [serializer(row) for row in pagination.items]
    payload = {
        "items": items,
        "has_next": pagination.has_next,
        "has_prev": pagination.has_prev,
        "pages": pagination.pages,
        "total": pagination.total,
        "next_num": pagination.next_num,
    }
    return jsonify(humps.camelize(payload))

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
        # TODO: for debugging 
        # with open(MOCK_RESUME, 'r') as f:
        #     resume_data = json.load(f)

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
    job_title_id = data.get("jobTitleId")

    # we only include the experience and projects
    # as this is what the LLM will give feedback on
    experience = resume.get("experience", [])
    projects = resume.get("projects", [])

    suggestions = {} 
    try:
        # only include the resume's experience and projects section
        resume_json = json.dumps({"experience": experience, "projects": projects})
        if (job_description != ""):
            suggestions = tailor.tailor_resume(resume_json, job_description)
        elif (job_title_id != ""):
            suggestions = tailor.tailor_resume_job_title(resume_json, job_title_id)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"status": 500, "errors": ["Something went wrong!"]}), 500

    return jsonify(humps.camelize(suggestions))

@app.route(JOB_TITLE_URL, methods=["GET"])
def get_job_titles():
    search = request.args.get("search") or request.args.get("query", "")
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    pagination = (
        JobTitle.query
        .filter(JobTitle.name.ilike(f"%{search.lower()}%"))
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return paginated_json(pagination)

if __name__ == '__main__':
    app.run(debug=True, port=5000)

