import os
from dotenv import load_dotenv
from celery import Celery
import analyzer

# Load environment variables from .env file for the Celery worker
load_dotenv()

# Config
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://redis:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://redis:6379/0')

celery = Celery(__name__, broker=CELERY_BROKER_URL, backend=CELERY_RESULT_BACKEND)

@celery.task(bind=True)
def analyze_audio_task(self, file_path, original_filename):
    """
    Background task to process audio.
    """
    print(f"--- [DEBUG] Task Started for {original_filename} ---")


    # This dictionary will accumulate all partial results.
    partial_results = {}

    def update_progress(status, step, progress):
        """Helper to send a consistent state update with accumulated partial results."""
        meta = {
            'status': status,
            'step': step,
            'progress': progress,
            'partial': partial_results
        }
        self.update_state(state='PROCESSING', meta=meta)

    # 1. Basic Metadata
    update_progress('Analyzing BPM and Key...', 'Analyzing metadata', 10)
    print("--- [DEBUG] Step 1: Calling analyze_meta ---")
    meta_data = analyzer.analyze_meta(file_path)
    partial_results['metadata'] = meta_data
    update_progress('Metadata complete', 'Metadata analyzed', 15) # 15%
    print(f"--- [DEBUG] Step 1 Complete (Metadata): {meta_data} ---")
    
    # 2. Stem Separation
    update_progress('Separating Stems (This takes a while)...', 'Separating stems', 20)
    song_id = original_filename.split('.')[0]
    output_dir = os.path.join("results", song_id)
    os.makedirs(output_dir, exist_ok=True)
    print("--- [DEBUG] Step 2: Starting Demucs Separation ---")
    stems = analyzer.separate_stems(file_path, output_dir)
    stems['master'] = file_path
    partial_results['stems'] = stems
    update_progress('Stems separated', 'Stems extracted', 50) # 50%
    print(f"--- [DEBUG] Step 2 Complete (Stems): {stems} ---")
   
    # 3. Analyze Individual Stems
    update_progress('Analyzing individual stems...', 'Detecting notes', 55)
    print("--- [DEBUG] Step 3: Analyzing notes for all relevant stems ---")
    notes_by_stem = analyzer.analyze_notes_for_stems(stems)
    partial_results['notes'] = notes_by_stem
    update_progress('Notes detected', 'Notes detected', 75) # 75%
    
    # 4. Lyrics and Chord Analysis (Hybrid Web + Local)
    # Use vocal stem for transcription if available, otherwise use original file
    vocal_stem_path = stems.get("master")
    lyrics_source_path = file_path
    if vocal_stem_path and os.path.exists(vocal_stem_path):
        lyrics_source_path = vocal_stem_path
    
    update_progress('Analyzing lyrics and chords...', 'Analyzing lyrics/chords', 80)
    artist = meta_data.get('artist')
    title = meta_data.get('title')
    
    # This new function tries UG first, then falls back to local Whisper.
    # It returns chords if UG is successful, otherwise chords are None.
    analysis_result = analyzer.analyze_lyrics(lyrics_source_path, artist=artist, title=title)
    lyrics = analysis_result.get("lyrics_lines", [])
    chords = analysis_result.get("chords")

    # If chords are None, it means UG failed and we need to run local chord analysis as a fallback.
    if chords is None:
        print("--- [INFO] Running local chord analysis as fallback. ---")
        chords = analyzer.analyze_chords(file_path)
    partial_results['chords'] = chords

    lyrics_doc_path = None
    merged_lyrics = []
    if lyrics and chords:
        update_progress('Merging lyrics and generating sheet...', 'Generating lyrics sheet', 95)
        merged_lyrics = analyzer.merge_lyrics_and_chords(lyrics, chords)
        
        doc_filename = f"{song_id}_lyrics.docx"
        lyrics_doc_path = os.path.join(output_dir, doc_filename)
        analyzer.create_lyrics_doc(original_filename, merged_lyrics, lyrics_doc_path)

    update_progress('Analysis complete', 'Finalizing', 100)

    # If lyrics were merged with chords, use the merged data.
    # Otherwise, use the original lyrics data.
    final_lyrics_data = merged_lyrics if merged_lyrics else lyrics
   
    # Compile final result
    
    result = {
        "metadata": meta_data,
        "chords": chords,
        "notes": notes_by_stem,
        "stems": stems,
        "song_id": song_id,
        "lyrics_data": final_lyrics_data,
        "lyrics_doc": lyrics_doc_path,
    }
    # Final (success) state is implicitly returned by celery; nothing else to update here
    return result