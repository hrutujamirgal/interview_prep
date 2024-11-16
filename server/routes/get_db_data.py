from pymongo import MongoClient, errors
from flask import Blueprint, jsonify, request
from dotenv import load_dotenv
import os
import random

load_dotenv()

get_routes = Blueprint('get_routes', __name__)

# Configuring with the database
try:
    client = MongoClient(os.getenv('MONGODB_URI'))
    db = client.get_default_database()
except errors.PyMongoError as e:
    print(f"Database connection error: {e}")
    db = None

@get_routes.route('/get_subjects', methods=['GET'])
def get_subject():
    try:
        if db is None:
            raise Exception("Database connection is not established.")
        
        collection = db['subject']
        documents = list(collection.find())

        for doc in documents:
            doc['_id'] = str(doc['_id'])

        return jsonify({'message': 'Subjects fetched successfully', 'subjects': documents}), 200

    except errors.PyMongoError as e:
        print(f"Database error while fetching subjects: {e}")
        return jsonify({'message': 'Error fetching subjects', 'error': str(e)}), 500

    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({'message': 'An unexpected error occurred', 'error': str(e)}), 500



from flask import jsonify, request
from pymongo import errors
import random

@get_routes.route('/get_mcq', methods=['POST'])
def get_mcq():
    try:
        if db is None:
            raise Exception("Database connection is not established.")
        
        data = request.json
        sub = data.get("subject_name")

        if not sub:
            return jsonify({'message': 'Subject name is required'}), 400

        collection = db['mcq_questions']
        
        document = collection.find_one({"subject_name": sub})  

        if document and "mcq_questions" in document:
            mcq_questions = document["mcq_questions"]
            if len(mcq_questions) > 3:
                random_questions = random.sample(mcq_questions, 3) 
            else:
                random_questions = mcq_questions  

            # Convert ObjectId to string for the response
            document['_id'] = str(document['_id'])
            document['subject_id'] = str(document['subject_id'])

            return jsonify({
                'message': 'MCQ questions fetched successfully',
                'mcq_questions': random_questions
            }), 200
        else:
            return jsonify({'message': 'No questions found for this subject'}), 404

    except errors.PyMongoError as e:
        print(f"Database error while fetching MCQs: {e}")
        return jsonify({'message': 'Error fetching MCQs', 'error': str(e)}), 500

    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({'message': 'An unexpected error occurred', 'error': str(e)}), 500



@get_routes.route('/get_random_subject', methods=['GET'])
def get_random_subject():
    try:
        if db is None:
            raise Exception("Database connection is not established.")

        collection = db['subject']
        random_subject = list(collection.aggregate([{"$sample": {"size": 1}}]))

        if random_subject:
            random_subject[0]['_id'] = str(random_subject[0]['_id'])

        return jsonify({
            'message': 'Random subject fetched successfully', 
            'subject': random_subject[0] if random_subject else None
        }), 200

    except errors.PyMongoError as e:
        print(f"Database error while fetching random subject: {e}")
        return jsonify({'message': 'Error fetching random subject', 'error': str(e)}), 500

    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({'message': 'An unexpected error occurred', 'error': str(e)}), 500
