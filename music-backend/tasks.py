import os
from celery import Celery
import analyzer

# Config
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

celery = Celery(__name__, broker=CELERY_BROKER_URL, backend=CELERY_RESULT_BACKEND)

@celery.task(bind=True)
def analyze_audio_task(self, file_path, original_filename):
    """
    Background task to process audio.
    """
    print(f"--- [DEBUG] Task Started for {original_filename} ---")
    
    # 1. Basic Metadata
    self.update_state(state='PROCESSING', meta={'status': 'Analyzing BPM and Key...', 'step': 'Analyzing metadata', 'progress': 10})
    print("--- [DEBUG] Step 1: Calling analyze_meta ---")
    meta_data = analyzer.analyze_meta(file_path)
    self.update_state(state='PROCESSING', meta={'status': 'Metadata complete', 'step': 'Metadata analyzed', 'progress': 15, 'partial': {'metadata': meta_data}})
    print(f"--- [DEBUG] Step 1 Complete (Metadata): {meta_data} ---")
    
    # 2. Stem Separation
    self.update_state(state='PROCESSING', meta={'status': 'Separating Stems (This takes a while)...', 'step': 'Separating stems', 'progress': 25})
    song_id = original_filename.split('.')[0]
    output_dir = os.path.join("results", song_id)
    os.makedirs(output_dir, exist_ok=True)
    print("--- [DEBUG] Step 2: Starting Demucs Separation ---")
    stems = analyzer.separate_stems(file_path, output_dir)
    self.update_state(state='PROCESSING', meta={'status': 'Stems separated', 'step': 'Stems extracted', 'progress': 50, 'partial': {'metadata': meta_data, 'stems': stems}})
    print(f"--- [DEBUG] Step 2 Complete (Stems): {stems} ---")

    # 3. Analyze Individual Stems
    self.update_state(state='PROCESSING', meta={'status': 'Analyzing individual stems...', 'step': 'Detecting notes', 'progress': 65})
    print("--- [DEBUG] Step 3: Analyzing notes for all relevant stems ---")
    notes_by_stem = analyzer.analyze_notes_for_stems(stems)
    self.update_state(state='PROCESSING', meta={'status': 'Notes detected', 'step': 'Detecting notes', 'progress': 75, 'partial': {'metadata': meta_data, 'stems': stems, 'notes': notes_by_stem}})
    
    # 4. Generate chords from the original audio file
    self.update_state(state='PROCESSING', meta={'status': 'Detecting chords...', 'step': 'Detecting chords', 'progress': 85})
    chords = analyzer.analyze_chords(file_path)
    self.update_state(state='PROCESSING', meta={'status': 'Chords detected', 'step': 'Finalizing', 'progress': 95, 'partial': {'metadata': meta_data, 'stems': stems, 'notes': notes_by_stem, 'chords': chords}})

    # Compile final result
    result = {
        "metadata": meta_data,
        "chords": chords,
        "notes": notes_by_stem,
        "stems": stems,
        "song_id": song_id
    }
    return result