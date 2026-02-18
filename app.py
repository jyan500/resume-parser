from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from utils.parser import parse_resume as parse_resume_helper

app = Flask(__name__)
CORS(app)  # Allow frontend to make requests

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

@app.route('/parse-resume', methods=['POST'])
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
    
    try:
        # Parse the resume
        resume_data = parse_resume_helper(filepath)
        
        # Clean up file
        os.remove(filepath)
        
        return jsonify(resume_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze', methods=['POST'])
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
