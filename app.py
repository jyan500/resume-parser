from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from utils.parser import parseResume

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok = True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})

@app.route("/parse-resume", methods=["POST"])
def parse_resume():
    # handle file upload
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400
    file = request.files["resume"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    
    # save file temporarily
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(filepath)

    try:
        # parse the resume
        resumeData = parseResume(filepath)

        # clean up file
        os.remove(filepath)

        return jsonify(resumeData)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json

    resumeText = data.get("resumeText")
    jobDescription = data.get("jobDescription")

    if not resumeText or not jobDescription:
        return jsonify({"error": "Missing required fields"}), 400

    # TODO: add fields 
    suggestions = {
        "missingKeywords": [],
        "recommendations": [],
    }

    return jsonify(suggestions)

if __name__ == "__main__":
    app.run(debug=True, port=5000)