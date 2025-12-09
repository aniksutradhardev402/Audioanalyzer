import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory,make_response
from flask_cors import CORS 
from tasks import analyze_audio_task, celery

# Load environment variables from .env file
load_dotenv()

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

    # task_result.info may be a dict when update_state was called in the task
    info = task_result.info
    if task_result.state == 'PENDING':
        response["status"] = "Pending..."
    elif task_result.state == 'SUCCESS':
        response["status"] = "Analysis complete!"
        response["info"] = {'progress': 100}
    elif task_result.state == 'PROCESSING':
        # When the task is processing, task_result.info is the metadata dict
        # sent from the task via update_state().
        if isinstance(task_result.info, dict): 
            # If info is a dictionary, extract the user-facing status message
            # and the structured data for progress, partial results, etc.
            response["status"] = task_result.info.get("status", "Processing...")

            info = {}
            if 'step' in task_result.info:
                info['step'] = task_result.info['step']
            if 'progress' in task_result.info:
                info['progress'] = task_result.info['progress']
            if 'partial' in task_result.info:
                info['partial'] = task_result.info['partial']
            if info:
                response['info'] = info
        else:
            # Fallback if info is not a dict during processing
            response["status"] = "Processing..."
    elif task_result.state == 'REVOKED':
        response["status"] = "Task cancelled by user."
    else:
        # This will now correctly catch 'FAILURE' and other unexpected states.
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

@app.route('/cancel/<task_id>', methods=['POST'])
def cancel_task(task_id):
    """
    Cancels a specific Celery task, purges all other pending tasks from the queue,
    and forgets the task's result.
    """
    app.logger.info(f"Received cancellation request for task {task_id}")
    try:
        # Step 1: Revoke the specific task.
        # If the task is running, terminate=True will attempt to kill the worker process.
        # WARNING: This is an aggressive action and can corrupt the worker pool,
        # which may be why new tasks get stuck in a PENDING state.
        # If the task is pending, it will be marked as REVOKED.
        celery.control.revoke(task_id, terminate=True)
        app.logger.info(f"Task {task_id} revocation request sent.")

        # Step 2: Purge all pending (un-started) tasks from the message queue.
        # This will remove the canceled task if it was pending, along with ALL other
        # tasks waiting in the queue.
        purged_count = celery.control.purge()
        app.logger.info(f"Purged {purged_count} pending tasks from the queue.")

        # Step 3: Forget the task's result from the result backend (e.g., Redis).
        # This removes the task's state and result from storage.
        celery.AsyncResult(task_id).forget()
        app.logger.info(f"Task {task_id} result forgotten from backend.")
        return jsonify({
            "task_id": task_id,
            "message": f"Task {task_id} cancellation request sent. {purged_count} pending tasks were purged from the queue."
        }), 200
    except Exception as e:
        app.logger.error(f"Error during task cancellation and purge for {task_id}: {e}")
        return jsonify({"error": "Failed to send cancellation/purge request"}), 500

@app.route('/files/<path:filename>', methods=['GET'])
def serve_file(filename):
    """
    Serves generated files.
    'filename' will be something like 'results/song_id/vocals.wav'
    """
    allowed_folders = ['results', 'uploads']
    
    if not any(filename.startswith(folder + '/') for folder in allowed_folders):
        return jsonify({"error": "Access denied"}), 403

    # Check for a query parameter to decide if it's a download request
    # This triggers the "Save As..." dialog in the browser.
    is_download = request.args.get('download') == 'true'

    # Serve the actual file
    resp = make_response(send_from_directory(
        os.getcwd(),
        filename,
        as_attachment=is_download
    ))

    # Explicit CORS headers so Web Audio can read samples
    # During dev you can safely use '*'
    resp.headers['Access-Control-Allow-Origin'] = '*'  # or 'http://localhost:5173'
    resp.headers['Access-Control-Allow-Headers'] = 'Range, Content-Type'
    resp.headers['Access-Control-Expose-Headers'] = 'Accept-Ranges, Content-Range, Content-Length'

    return resp

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)