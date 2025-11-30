# import sys
# import json
# import madmom

# def detect_chords_for_file(file_path):
#     """
#     This function runs in a separate process to avoid import conflicts.
#     It takes a file path, detects chords, and prints the result as JSON.
#     """
#     chords = []
#     try:
#         proc = madmom.features.chords.CNNChordRecognitionProcessor()
#         chord_data = proc(file_path)

#         for start_time, end_time, chord_name in chord_data:
#             chords.append({"start_time": float(start_time), "end_time": float(end_time), "chord_name": chord_name})
#     except Exception as e:
#         # Print errors to stderr so they can be captured
#         print(f"Madmom subprocess error: {e}", file=sys.stderr)
#         # Return an empty list on failure
#         chords = [{"error": "Chord detection failed in subprocess."}]

#     # Print the final JSON result to standard output
#     print(json.dumps(chords))

# if __name__ == "__main__":
#     if len(sys.argv) > 1:
#         audio_file = sys.argv[1]
#         detect_chords_for_file(audio_file)