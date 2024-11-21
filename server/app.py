from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import datetime
from dotenv import load_dotenv
from flask_cors import CORS
from moviepy.editor import VideoFileClip
import shutil
import subprocess
import speech_recognition as sr
from database import initialize_db
from routes.user_routes import user_routes
from routes.get_db_data import get_routes
from routes.interview_routes import interview_route
from routes.questionGeneration import questionGeneration
# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')

CORS(app)

initialize_db(app)

# Register routes
app.register_blueprint(user_routes)
app.register_blueprint(get_routes)
app.register_blueprint(interview_route)
app.register_blueprint(questionGeneration)
@app.route('/')
def index():
    return "MongoDB connected with Flask using MongoEngine"

# Set the allowed file extensions for the upload
ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv', 'flv'}

# Set the upload folder
UPLOAD_FOLDER = 'uploads/'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
AUDIO_FOLDER = 'audio_files/'
if not os.path.exists(AUDIO_FOLDER):
    os.makedirs(AUDIO_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['AUDIO_FOLDER'] = AUDIO_FOLDER

# Function to check if the file has an allowed extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Variable to store all transcribed answers
all_answers = []

# Route to handle file uploads
@app.route('/upload', methods=['POST'])
def upload_file():
    global all_answers  # Use the global list to store all transcriptions
    
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Allowed types: mp4, mov, avi, mkv, flv"}), 400

    filename = secure_filename(file.filename)
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    unique_filename = f"{timestamp}_{filename}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)

    # Extract audio from video in WAV format
    audio_file_path = extract_audio_from_video(file_path, unique_filename)
    if audio_file_path is None:
        return jsonify({"error": "Error extracting audio from video"}), 500

    # Transcribe audio to text
    transcription = transcribe_audio(audio_file_path)
    if transcription is None:
        return jsonify({"error": "Error transcribing audio"}), 500

    # Append the transcription to the list/
    all_answers.append(transcription)

    # Debugging: Print transcription and all_answers
    print(f"Current transcription: {transcription}")
    print(f"All accumulated answers: {all_answers}")

    return jsonify({
        "transcription": transcription,
        "all_answers": all_answers  # Include the list of all transcriptions in the response
    }), 200

    
def extract_audio_from_video(video_path, video_filename):
    try:
        # Set the audio output file path (WAV format) in the new audio folder
        audio_filename = f"{video_filename.rsplit('.', 1)[0]}.wav"
        audio_file_path = os.path.join(app.config['AUDIO_FOLDER'], audio_filename)

        # Specify the path to FFmpeg executable
        ffmpeg_path = "C:\\Users\\Sushant\\Downloads\\ffmpeg-master-latest-win64-gpl\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe"

        # Use FFmpeg to extract audio from the video
        command = [
            ffmpeg_path,                # Path to FFmpeg executable
            '-i', video_path,           # Input video file
            '-vn',                      # No video (only audio)
            '-acodec', 'pcm_s16le',     # Audio codec for WAV format
            '-ar', '44100',             # Set audio sample rate
            '-ac', '2',                 # Set the number of audio channels (stereo)
            audio_file_path             # Output WAV file path
        ]
        
        # Execute the FFmpeg command
        subprocess.run(command, check=True)

        return audio_file_path
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Function to transcribe audio to text
def transcribe_audio(audio_path):
    recognizer = sr.Recognizer()
    
    try:
        # Load the audio file using SpeechRecognition
        with sr.AudioFile(audio_path) as source:
            audio_data = recognizer.record(source)  # Capture the entire audio file
            
        # Recognize speech using Google Web Speech API
        transcription = recognizer.recognize_google(audio_data)  # Use Google STT API

        return transcription
    except sr.UnknownValueError:
        return "Audio could not be understood"
    except sr.RequestError:
        return "Speech recognition service is unavailable"

if __name__ == '__main__':
    app.run(debug=True)