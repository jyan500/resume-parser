from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import io
from utils.parser import ResumeParser
import json
from utils.routes import ( PARSE_RESUME_URL, ANALYZE_RESUME_URL )

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")
app.config["GEMINI_API_KEY"] = os.environ.get("GEMINI_API_KEY")
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

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

@app.route(PARSE_RESUME_URL, methods=['POST'])
def parse_resume():
    # Handle file upload
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided'}), 400
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
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
        return jsonify({'error': str(e)}), 422
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up file
        os.remove(filepath)
        
    return jsonify(resume_data)


@app.route(ANALYZE_RESUME_URL, methods=['POST'])
def analyze():
    data = request.json
    
    resume_text = data.get('resume_text')
    job_description = data.get('job_description')
    
    if not resume_text or not job_description:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # TODO: Add keyword extraction and matching logic here
    suggestions = {
        'missing_keywords': [],
        'recommendations': []
    }
    
    return jsonify(suggestions)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
