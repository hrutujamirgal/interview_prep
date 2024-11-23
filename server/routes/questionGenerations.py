import logging
import joblib
from flask import Blueprint,Flask, request, jsonify
from difflib import SequenceMatcher
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util 

# Enable logging for debugging
logging.basicConfig(level=logging.DEBUG)

questionGeneration = Blueprint('questionGeneration', _name_)
# API Key for Gemini
model = joblib.load('F:\Full stack projects\interview_prep\models\spiece.model')


# Flask setup
app = Flask(_name_)
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
        current_answer = data.get("currentAnswer")
        follow_up_index = data.get("followUpIndex")
        topic = data.get("topic")
        current_difficulty = data.get("difficulty", "basic")

        if not current_answer or follow_up_index is None or not topic:
            return jsonify({"error": "currentAnswer, followUpIndex, and topic are required."}), 400

        # Determine the next difficulty level
        difficulty_levels = ["basic", "intermediate", "advanced"]
        current_level_index = difficulty_levels.index(current_difficulty)
        next_difficulty = (
            difficulty_levels[min(current_level_index + 1, len(difficulty_levels) - 1)]
        )

        if current_answer.lower() in ["i don't know", "i am not sure", "no idea"]:
            follow_up_prompt = f"Generate the next {next_difficulty} question related to {topic} (maximum 15 words) for the interview."
        else:
            follow_up_prompt = (
                f"Generate a {next_difficulty} follow-up question based on the answer: '{current_answer}' (maximum 15 words)."
            )

        follow_up_content = generate_content(follow_up_prompt)

        # Calculate correctness percentage if applicable
        correctness_percentage = calculate_correctness(current_answer, follow_up_content)

        if "Answer:" in follow_up_content:
            next_question, next_answer = follow_up_content.split("Answer:", 1)
            next_question = enforce_word_limit(next_question.strip(), max_words=15)
            follow_up_data = {
                "question": next_question,
                "correctAnswer": next_answer.strip(),
                "correctnessPercentage": correctness_percentage,
                "followUpIndex": follow_up_index + 1,
                "difficulty": next_difficulty
            }
            return jsonify(follow_up_data)
        else:
            follow_up_question = enforce_word_limit(follow_up_content.strip(), max_words=15)
            follow_up_data = {
                "question": follow_up_question,
                "correctAnswer": "No answer provided in the follow-up content.",
                "correctnessPercentage": correctness_percentage,
                "followUpIndex": follow_up_index + 1,
                "difficulty": next_difficulty
            }
            return jsonify(follow_up_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500