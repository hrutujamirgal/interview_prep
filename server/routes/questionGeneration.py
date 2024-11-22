import logging
import google.generativeai as genai
from flask import Blueprint,Flask, request, jsonify
from difflib import SequenceMatcher
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util 
import os
from dotenv import load_dotenv
import re

load_dotenv()

# Enable logging for debugging
logging.basicConfig(level=logging.DEBUG)

questionGeneration = Blueprint('questionGeneration', __name__)
# API Key for Gemini
API_KEY = os.getenv('API_KEY') 
genai.configure(api_key=API_KEY)

# Flask setup
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Generation configuration for Gemini model
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}
def calculate_similarity_bert(text1, text2):
    try:
        # Encode the texts into BERT embeddings
        embeddings1 = bert_model.encode(text1, convert_to_tensor=True)
        embeddings2 = bert_model.encode(text2, convert_to_tensor=True)

        # Calculate cosine similarity
        similarity = util.cos_sim(embeddings1, embeddings2).item()  # Convert tensor to float
        similarity_percentage = round(similarity * 100, 2)  # Convert to percentage
        logging.info(f"Similarity between '{text1}' and '{text2}': {similarity_percentage}%")
        return similarity_percentage

    except Exception as e:
        logging.error(f"Error in BERT similarity calculation: {e}")
        raise Exception(f"Error calculating similarity using BERT: {str(e)}")

# Initialize the model
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

# Function to call the Gemini API for generating content
def generate_content(prompt):
    try:
        # Start a chat session with an empty history
        chat_session = model.start_chat(history=[])

        # Send the prompt to the Gemini API
        response = chat_session.send_message(prompt)

        # Return the generated response
        return response.text.strip()

    except Exception as e:
        raise Exception(f"Error generating content from Gemini API: {str(e)}")

# Calculate correctness percentage
def calculate_correctness(user_answer, correct_answer):
    similarity = SequenceMatcher(None, user_answer.lower(), correct_answer.lower()).ratio()
    return round(similarity * 100, 2)

# Route to handle first question and answer generation# Function to truncate or regenerate a question exceeding the word limit
def enforce_word_limit(question, max_words=15):
    words = question.split()
    if len(words) > max_words:
        # Truncate the question if it exceeds the word limit
        truncated_question = " ".join(words[:max_words]) + "..."
        return truncated_question
    return question.strip()

# Route to handle first question and answer generation
@questionGeneration.route('/api/interview/question', methods=['POST'])
def generate_question():
    try:
        data = request.json
        topic = data.get("topic")
        

        if not topic:
            return jsonify({"error": "Topic is required."}), 400

        # Start with a very basic question
        difficulty = "medium"
        print(topic)
        prompt = f"You're an interviewer conducting a technical interview on {topic}. Ask a {difficulty} question (maximum 15 words) and provide an answer."

        # Generate the initial question and answer
        content = generate_content(prompt)

        if "Answer:" in content:
            question, answer = content.split("Answer:", 1)
            question = enforce_word_limit(question.strip(), max_words=15)
            follow_up_data = {
                "question": question,
                "correctAnswer": answer.strip(),
                "followUpIndex": 0,
                "difficulty": difficulty
            }
            return jsonify(follow_up_data)
        else:
            question = enforce_word_limit(content.strip(), max_words=15)
            return jsonify({
                "question": question,
                "correctAnswer": "No answer provided in the generated content.",
                "followUpIndex": 0,
                "difficulty": difficulty
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Route to handle follow-up question generation
@questionGeneration.route('/api/interview/follow-up', methods=['POST'])
def generate_follow_up():
    try:
        data = request.json
        topic = data.get("topic")
        

        if not topic:
            return jsonify({"error": "Topic is required."}), 400

        # Start with a very basic question
        difficulty = "medium"
        prompt = f"You're an interviewer conducting a technical interview on {topic}. Ask a 5 different {difficulty} question (maximum 15 words) and provide an answer to those questions and give indxing as Question 1 and so on. Give the question and the answer in an object with the index."

        content = generate_content(prompt)
        return jsonify(content)


    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Route to handle follow-up question generation
@questionGeneration.route('/questions', methods=['POST'])
def generate_fullI_questions():
    try:
        data = request.json
        topic = data.get("topic")
        
        if not topic:
            return jsonify({"error": "Topic is required."}), 400

        prompt = f"You're an interviewer conducting a technical interview on computer science topics. Ask a 10 different mix question (maximum 15 words) on both technical and HR round and provide an answer to those questions and give indexing as Question 1 and so on. Give the question and the answer in an object with the index."

        content = generate_content(prompt)
        return jsonify(content)


    except Exception as e:
        return jsonify({"error": str(e)}), 500


