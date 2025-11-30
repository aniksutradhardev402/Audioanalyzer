import librosa
import numpy as np
import subprocess
import os
import json
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
import essentia.standard as es

def analyze_meta(file_path):
    """Extracts high-level metadata: BPM, Key, Loudness, etc."""
    # Load a 60-second mono segment for efficient analysis
    y, sr = librosa.load(file_path, duration=60) 

    # 1. Get BPM (Tempo)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    
    # 2. Get Key and Mode (e.g., C# minor)
    # This is an advanced template-matching method for key detection.
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    song_chroma_profile = np.sum(chroma, axis=1)

    # Define standard templates for major and minor keys (Krumhansl-Schmuckler profiles)
    major_template = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
    minor_template = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    best_score = -1
    estimated_key = "N/A"

    # Correlate the song's profile with all 24 possible key templates
    for i in range(12):
        # Test against major template for the current root note
        rotated_major_template = np.roll(major_template, i)
        major_score = np.corrcoef(song_chroma_profile, rotated_major_template)[0, 1]
        if major_score > best_score:
            best_score = major_score
            estimated_key = f"{notes[i]} major"

        # Test against minor template for the current root note
        rotated_minor_template = np.roll(minor_template, i)
        minor_score = np.corrcoef(song_chroma_profile, rotated_minor_template)[0, 1]
        if minor_score > best_score:
            best_score = minor_score
            estimated_key = f"{notes[i]} minor"

    # 3. Get average loudness (RMS)
    # This was missing from the previous version, causing an error.
    rms = librosa.feature.rms(y=y)
    avg_rms = float(np.mean(rms))
    
    # 4. Get average spectral centroid (brightness)
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    avg_spectral_centroid = float(np.mean(spectral_centroid))

    return {
        "bpm": round(float(tempo), 2), # Force float conversion
        "duration_seconds": float(librosa.get_duration(path=file_path)), # Get duration of the full file
        "estimated_key": estimated_key,
        "loudness_rms": round(avg_rms, 4),
        "brightness_spectral_centroid": round(avg_spectral_centroid, 2)
    }

def analyze_chords(file_path):
    """
    Detects chords using the Essentia library.
    """
    try:
        # Parameters for analysis
        sample_rate = 44100
        frame_size = 4096
        hop_size = 512

        # 1. Load audio
        audio = es.MonoLoader(filename=file_path, sampleRate=sample_rate)()

        # 2. Set up the frame-based processing pipeline
        hpcp_extractor = es.HPCP()
        spectral_peaks = es.SpectralPeaks()
        spectrum = es.Spectrum()
        window = es.Windowing(type='blackmanharris62')

        # 3. Iterate through audio frames and extract HPCP features
        hpcp_frames = []
        for frame in es.FrameGenerator(audio, frameSize=frame_size, hopSize=hop_size, startFromZero=True):
            spec = spectrum(window(frame))
            frequencies, magnitudes = spectral_peaks(spec)
            hpcp_frames.append(hpcp_extractor(frequencies, magnitudes))

        # 4. Run the chord detection model on the collected HPCP frames
        chords_list, _ = es.ChordsDetection(hopSize=hop_size)(hpcp_frames)
        
        # 5. Post-process to get start and end times
        chords = []
        if not chords_list:
            return [{"error": "No chords found by Essentia."}]

        # Essentia gives a list of chords and we need to calculate their duration
        frame_duration = hop_size / sample_rate

        for i, chord in enumerate(chords_list):
            start_time = i * frame_duration
            end_time = (i + 1) * frame_duration
            chords.append({"start_time": start_time, "end_time": end_time, "chord_name": chord})

    except Exception as e:
        print(f"An unexpected error occurred in Essentia chord detection: {e}")
        return [{"error": "An unexpected error occurred during chord detection."}]

    return chords

def analyze_notes_for_stems(stems_dict):
    """
    Runs note detection on all relevant stems (excluding drums) and returns a
    dictionary of the results.
    """
    all_notes = {}
    
    # Define which stems are melodic/harmonic and should be analyzed for notes
    stems_to_process = ['vocals', 'bass', 'guitar', 'piano', 'other']
    
    for stem_name in stems_to_process:
        if stem_name in stems_dict and os.path.exists(stems_dict[stem_name]):
            print(f"--- [Internal] Analyzing notes for '{stem_name}' stem ---")
            # This reuses the existing single-file analysis function
            notes = analyze_notes_basic_pitch(stems_dict[stem_name])
            all_notes[stem_name] = notes
        else:
            print(f"--- [WARN] Stem '{stem_name}' not found or file is missing. Skipping note analysis. ---")
            all_notes[stem_name] = [] # Return empty list for missing stems
            
    return all_notes

def analyze_notes_basic_pitch(file_path):
    """
    Uses Spotify's Basic Pitch to detect MIDI notes.
    """
    try:
        # predict returns: model_output, midi_data, note_events
        _, _, note_events = predict(file_path)
        
        notes_json = []
        for note in note_events:
            # CRITICAL FIX: Cast numpy types to Python native types
            notes_json.append({
                "start": float(note[0]),
                "end": float(note[1]),
                "pitch": int(note[2]),    # Cast numpy.int64 to int
                "velocity": float(note[3]) # Cast numpy.float32 to float
            })
        return notes_json
    except Exception as e:
        print(f"Error in Basic Pitch: {e}")
        return []

def separate_stems(file_path, output_dir):
    """
    Calls Demucs via subprocess to separate audio into 6 stems.
    """
    # Demucs command for 6-stem separation (htdemucs_6s model)
    command = [
        "demucs",
        "-n", "htdemucs_6s",
        "--out", output_dir,
        file_path
    ]
    
    print(f"Starting Demucs separation for {file_path}...")
    subprocess.run(command, check=True)
    
    filename = os.path.basename(file_path).split('.')[0]
    model_name = "htdemucs_6s"
    
    # Demucs puts files in: output_dir/model_name/filename/
    stem_path = os.path.join(output_dir, model_name, filename)

    return {
        "vocals": os.path.join(stem_path, "vocals.wav"),
        "drums": os.path.join(stem_path, "drums.wav"),
        "bass": os.path.join(stem_path, "bass.wav"),
        "piano": os.path.join(stem_path, "piano.wav"),
        "guitar": os.path.join(stem_path, "guitar.wav"),
        "other": os.path.join(stem_path, "other.wav"),
    }