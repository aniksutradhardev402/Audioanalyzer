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
    
    # 1. Basic Metadata — compute metadata and then publish it as a partial result
    print("--- [DEBUG] Step 1: Calling analyze_meta ---")
    meta_data = analyzer.analyze_meta(file_path)
    self.update_state(
        state='PROCESSING',
        meta={
            'status': 'Analyzing BPM and Key...',
            'progress': 10,
            'step': 'metadata',
            'partial': {'metadata': meta_data},
        },
    )
    print(f"--- [DEBUG] Step 1 Complete (Metadata): {meta_data} ---")
    
    # 2. Stem Separation
    song_id = original_filename.split('.')[0]
    output_dir = os.path.join("results", song_id)
    os.makedirs(output_dir, exist_ok=True)
    print("--- [DEBUG] Step 2: Starting Demucs Separation ---")
    stems = analyzer.separate_stems(file_path, output_dir)
    self.update_state(
        state='PROCESSING',
        meta={
            'status': 'Separating stems (this takes a while)...',
            'progress': 40,
            'step': 'separate_stems',
            'partial': {'stems': stems},
        },
    )
    print(f"--- [DEBUG] Step 2 Complete (Stems): {stems} ---")

    # 3. Analyze Individual Stems
    print("--- [DEBUG] Step 3: Analyzing notes for all relevant stems ---")
    notes_by_stem = analyzer.analyze_notes_for_stems(stems)
    self.update_state(
        state='PROCESSING',
        meta={
            'status': 'Analyzing individual stems...',
            'progress': 70,
            'step': 'analyze_stems',
            'partial': {'notes': notes_by_stem},
        },
    )
    
    # 4. Generate chords from the original audio file
    chords = analyzer.analyze_chords(file_path)
    self.update_state(
        state='PROCESSING',
        meta={
            'status': 'Detecting chords...',
            'progress': 90,
            'step': 'detect_chords',
            'partial': {'chords': chords},
        },
    )

    # Compile final result
    # Final result - when the task finishes this will be returned by Celery
    result = {
        "metadata": meta_data,
        "chords": chords,
        "notes": notes_by_stem,
        "stems": stems,
        "song_id": song_id
    }
    # Final (success) state is implicitly returned by celery; nothing else to update here
    return result