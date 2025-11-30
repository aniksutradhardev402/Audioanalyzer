import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS 
from tasks import analyze_audio_task, celery

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['RESULTS_FOLDER'] = 'results'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save file
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    # Trigger Async Task
    task = analyze_audio_task.delay(filepath, file.filename)
    
    return jsonify({"task_id": task.id, "message": "Processing started"}), 202

@app.route('/status/<task_id>', methods=['GET'])
def get_status(task_id):
    task_result = celery.AsyncResult(task_id)
    response = {
        "task_id": task_id,
        "state": task_result.state,
    }
    if task_result.state == 'PENDING':
        response["status"] = "Pending..."
    elif task_result.state != 'FAILURE':
        response["status"] = str(task_result.info)
    else:
        response["status"] = "Something went wrong"
        response["error"] = str(task_result.info)
        
    return jsonify(response)

@app.route('/result/<task_id>', methods=['GET'])
def get_result(task_id):
    task_result = celery.AsyncResult(task_id)
    if task_result.state == 'SUCCESS':
        return jsonify(task_result.result)
    else:
        return jsonify({"error": "Task not ready or failed"}), 400

@app.route('/files/<path:filename>', methods=['GET'])
def serve_file(filename):
    """
    Serves generated files.
    'filename' will be something like 'results/song_id/vocals.wav'
    """
    # 1. Security Check: Only allow access to specific folders
    allowed_folders = ['results', 'uploads']
    
    # Check if the requested file starts with an allowed folder
    if not any(filename.startswith(folder + '/') for folder in allowed_folders):
        return jsonify({"error": "Access denied"}), 403

    # 2. Serve from the current working directory (root of /app)
    # This works because 'filename' already contains the folder path
    return send_from_directory(os.getcwd(), filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)