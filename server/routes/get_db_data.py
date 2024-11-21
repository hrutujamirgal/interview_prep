#ek ha change
import pymongo
import logging
from flask import Blueprint, jsonify, request
from dotenv import load_dotenv
import os
import random
from bson import ObjectId
from datetime import datetime
#ankhi ek haa change
logging.basicConfig(level=logging.WARNING)
load_dotenv()

get_routes = Blueprint('get_routes', __name__)

# Configuring with the database
try:
    #ek haa change
    # client = MongoClient(os.getenv('MONGODB_URI'))
    client = pymongo.MongoClient(os.getenv('MONGODB_URI'))

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



@get_routes.route("/get_report/<name>/<user>", methods=['GET'])
def get_report(name, user):
    if not name:
        return jsonify({"error": "Name parameter is required"}), 400

    table = None
    if name == 'mcq':
        table = db['m_c_q_model']
    elif name == 'coding':
        table =  db['coding_model']
    # elif name == 'technical':
    #     table = Interview
    else:
        return jsonify({"error": "Invalid report type"}), 400

    try:
        user = ObjectId(user)  
    except:
        pass 

    try:
        records = list(table.find({ 'userId': user}))
        for record in records:
            record['_id'] = str(record['_id'])
            record['userId'] = str(record['userId'])
            if 'date' in record and record['date']:  
                record['date'] = record['date'].strftime('%d-%m-%Y')
        
        
        return jsonify(records), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500



@get_routes.route('/get_coding_question', methods=['GET'])
def get_coding_question():
    try:
        if db is None:
            raise Exception("Database connection is not established.")

        # Fetch random questions from the database
        collection = db['programmingQuestions']
        random_questions = list(collection.aggregate([{"$sample": {"size": 3}}]))

        # Convert ObjectId to string
        for question in random_questions:
            question['_id'] = str(question['_id'])

        return jsonify({"questions": random_questions}), 200

    except errors.PyMongoError as e:
        print(f"Database error while fetching coding questions: {e}")
        return jsonify({
            'message': 'Error fetching coding questions',
            'error': str(e)
        }), 500

    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({
            'message': 'An unexpected error occurred',
            'error': str(e)
        }), 500


@get_routes.route('/send_feedback', methods=['POST'])
def send_feedback():
    try:
        # Parse the JSON payload
        data = request.json

        if not data:
            return jsonify({'message': 'Invalid data. JSON payload is required.'}), 400

        required_fields = ['rate', 'feedback', 'userId']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'message': 'Missing required fields', 'fields': missing_fields}), 400

        if not isinstance(data.get('rate'), (int, float)) or not (0 <= data['rate'] <= 5):
            return jsonify({'message': 'Invalid rate. It must be a number between 0 and 5.'}), 400

        try:
            data['userId'] = ObjectId(data['userId'])
        except Exception:
            return jsonify({'message': 'Invalid userId. It must be a valid ObjectId string.'}), 400

        data['created_at'] = datetime.utcnow()

        collection = db['feedback']
        feedback_id = collection.insert_one(data).inserted_id

        return jsonify({'message': 'Feedback saved successfully', 'feedback_id': str(feedback_id)}), 201

    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({'message': 'An unexpected error occurred', 'error': str(e)}), 500
