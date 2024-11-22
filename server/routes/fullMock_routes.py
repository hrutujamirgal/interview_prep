from models import User , MCQModel, CodingModel, FullMock
from flask import jsonify, request, send_file, Blueprint
from datetime import datetime
from bson import ObjectId
from reportlab.pdfgen import canvas
import os
from routes.questionGeneration import calculate_correctness
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from pyexpat import errors
import pymongo
import logging
from flask import Blueprint, jsonify, request, send_file
from dotenv import load_dotenv
import os
import random
from bson import ObjectId
from datetime import datetime
from PyPDF2 import PdfMerger
logging.basicConfig(level=logging.WARNING)
load_dotenv()

mock_route = Blueprint('mock_route', __name__)

try:
    #ek haa change
    # client = MongoClient(os.getenv('MONGODB_URI'))
    client = pymongo.MongoClient(os.getenv('MONGODB_URI'))

    db = client.get_default_database()
except errors.PyMongoError as e:
    print(f"Database connection error: {e}")
    db = None


@mock_route.route('/get_mcqs', methods=['GET'])
def get_mcq():
    try:

        collection = db['mcq_questions']
        
        document = collection.find_one()  

        if document and "mcq_questions" in document:
            mcq_questions = document["mcq_questions"]
            if len(mcq_questions) > 10:
                random_questions = random.sample(mcq_questions, 10) 
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



@mock_route.route('/get_coding_questions', methods=['GET'])
def get_coding_question():
    try:
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



def create_pdf_with_reportlab(data, file_path, topic):
    # A4 page size dimensions
    width, height = A4
    margin = 40  
    p = canvas.Canvas(file_path, pagesize=A4)

    p.setFont("Helvetica-Bold", 16)
    p.drawString((width - 300) / 2, height - margin, f"MCQ Test Report on {topic}")
    y_position = height - margin - 40  

    p.setFont("Helvetica", 12)
    score = 0

    for question_data in data:
        # Print Question
        p.drawString(margin, y_position, f"Question: {question_data['question']}")
        y_position -= 20

        # Print Options
        for option in question_data["options"]:
            p.drawString(margin + 20, y_position, f"Option: {option}")
            y_position -= 20

        p.drawString(margin, y_position, f"Answer: {question_data['answer']}")
        y_position -= 20
        p.drawString(margin, y_position, f"Selected Option: {question_data['selected_option']}")
        y_position -= 20

        question_score = 1 if question_data['selected_option'] == question_data['answer'] else 0
        score += question_score
        p.drawString(margin, y_position, f"Score: {question_score}")
        y_position -= 30  

        if y_position < margin:
            p.showPage()
            y_position = height - margin - 40 

    p.drawString(margin, y_position, f"Total Score: {score}")
    y_position -= 30
    score *= 10

    p.showPage()
    p.save()

    return score




@mock_route.route('/get_mcq_score', methods=['POST'])
def get_mcq_report():
    try:
        data = request.json
        user_id = data.get('user_id')
        selected_topic = "Full Mock"
        questions = data.get('questions')

        # Convert user_id to ObjectId
        try:
            user_id = ObjectId(user_id)
        except Exception:
            return jsonify({"error": "Invalid user_id format"}), 400

        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Define file path for the PDF
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        pdf_filename = f"mcq_report_{user_id}_{timestamp}.pdf"
        file_path = os.path.join("reports/mcq", pdf_filename)

        os.makedirs("reports/mcq", exist_ok=True)

        score = create_pdf_with_reportlab(questions, file_path, selected_topic)

        mcq_instance = MCQModel(
            userId=user,
            selectedTopic=selected_topic,
            score=score,
            report=file_path  
        )
        mcq_instance.save()

        return jsonify({"score":score, "path": file_path})

    except Exception as e:
        return jsonify({"error": str(e)}), 500




def create_pdf_with_reportlab_coding(data, file_path):
    # A4 page size dimensions
    width, height = A4
    margin = 40  # Margin from edges (top, bottom, left, right)

    # Create the PDF and save it to the specified file path
    p = canvas.Canvas(file_path, pagesize=A4)

    # Title
    p.setFont("Helvetica-Bold", 16)
    p.drawString((width - 300) / 2, height - margin, "Coding Test Report")
    y_position = height - margin - 40  # Adjust position for title

    p.setFont("Helvetica", 12)
    score = 0
    index = 0

    for question_data in data:
        # Print Question Title and Description
        p.drawString(margin, y_position, f"Question: {question_data['title']}")
        y_position -= 20
        p.drawString(margin, y_position, f"Description: {question_data['description']}")
        y_position -= 20

        # Print Code
        p.setFont("Courier", 10)  # Monospaced font for code
        p.drawString(margin, y_position, "Code:")
        y_position -= 15
        code_snippet = question_data['code']
        lines = code_snippet.splitlines()
        line_height = 12

        for line in lines:
            p.drawString(margin, y_position, line)  # Print each line of code
            y_position -= line_height

        y_position -= 20  # Add space after code snippet

        # Print Test Case Results
        p.setFont("Helvetica", 12)
        p.drawString(margin, y_position, f"Test Cases Passed: {question_data['totalPassed']}")
        y_position -= 20
        p.drawString(margin, y_position, f"Total Test Cases: {question_data['totalTests']}")
        y_position -= 20

        # Calculate and print score for each question
        question_score = (question_data['totalPassed'] / question_data['totalTests']) * 10
        score += question_score
        p.drawString(margin, y_position, f"Score: {question_score}")
        y_position -= 30  # Extra space between questions
        index += 1

        if y_position < margin:  # Start a new page if we reach the bottom
            p.showPage()
            p.setFont("Helvetica", 12)
            y_position = height - margin - 40  # Reset y position for new page

    # Calculate and print the total score at the end
    score /= index
    p.drawString(margin, y_position, f"Total Score: {score:.2f}")
    y_position -= 30

    # Finish up the PDF
    p.showPage()
    p.save()

    return score


@mock_route.route('/get_coding_score', methods=['POST'])
def get_coding_report():
    try:
        data = request.json
        user_id = data.get('user_id')
        questions = data.get('questions')
        print(user_id)

        # Convert user_id to ObjectId
        try:
            user_id = ObjectId(user_id)
        except Exception:
            return jsonify({"error": "Invalid user_id format"}), 400

        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Define file path for the PDF
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        pdf_filename = f"coding_report_{user_id}_{timestamp}.pdf"
        file_path = os.path.join("reports/coding", pdf_filename)

        # Ensure the "reports" directory exists
        os.makedirs("reports/coding", exist_ok=True)
        print("till here ok")

        # Create the PDF and save it to the file path
        score = create_pdf_with_reportlab_coding(questions, file_path)
        print(score)

        # Store the file path in MongoDB (not the PDF content itself)
        coding_instance = CodingModel(
            userId=user,
            score=score,
            report=file_path  
        )
        coding_instance.save()

        # Send the PDF file as a downloadable attachment
        return jsonify({"score":score, "path": file_path})

    except Exception as e:
        return jsonify({"error": str(e)}), 500





def create_pdf_with_reportlab_interview(data, file_path, topic):
    # A4 page size dimensions
    width, height = A4
    margin = 40  # Margin from edges (top, bottom, left, right)

    # Create the PDF and save it to the specified file path
    p = canvas.Canvas(file_path, pagesize=A4)

    # Title
    p.setFont("Helvetica-Bold", 16)
    p.drawString((width - 300) / 2, height - margin, f"Interview Report on {topic}")
    y_position = height - margin - 40  # Adjust position for title

    p.setFont("Helvetica", 12)
    score = 0

    for question_data in data:
        p.drawString(margin, y_position, f"Question: {question_data['question']}")
        y_position -= 20
        p.drawString(margin + 20, y_position, f"Candidate's Answer: {question_data['userAnswer']}")
        y_position -= 20

        # Print answer correctness
        correct = calculate_correctness(question_data['userAnswer'], question_data['answer'])
        p.drawString(margin, y_position, f"Answer correctness: {correct}")
        y_position -= 20
        
        # Print status
        p.drawString(margin, y_position, f"Status: {question_data['confidence_status']}")
        y_position -= 20

        score += question_data['confidence_score']

        if y_position < margin:  # Start a new page if we reach the bottom
            p.showPage()
            p.setFont("Helvetica", 12)
            y_position = height - margin - 40  # Reset y position for new page

    # Print total score at the end
    score = (score / 250) * 100

    if y_position < margin:  # Start a new page if we reach the bottom
        p.showPage()
        p.setFont("Helvetica", 12)
        y_position = height - margin - 40  # Reset y position for new page

    y_position -= 50
    p.drawString(margin, y_position, f"Overall Confidence: {score}%")
    y_position -= 30

    status = ""
    if 85 <= score <= 98:
        status = "Excellent! You are highly confident and well-prepared for the interview."
    elif 70 <= score <= 84:
        status = "Good. You are confident and have a strong understanding of the topic."
    elif 55 <= score <= 69:
        status = "Fair. You are moderately confident, but there’s room for improvement."
    elif 30 <= score <= 54:
        status = "Low confidence. You might need more preparation and understanding of the topic."
    elif 15 <= score <= 29:
        status = "Very low confidence. It’s crucial to prepare further and improve your knowledge."
    elif 0 <= score <= 14:
        status = "Extremely low confidence. You need significant preparation and practice."

    p.drawString(margin, y_position, f"{status}")
    y_position -= 80

    p.drawString(margin, y_position, f"Prepare Well Using Interview Perp")

    # Finish up the PDF
    p.showPage()
    p.save()

    return score




@mock_route.route('/get_report_score', methods=['POST'])
def get_report():
    try:
        data = request.json.get('component')
        mcq = request.json.get('mcq')
        code = request.json.get('code')
        user_id = data.get('user_id')
        selected_topic = 'Full Mock Interview'
        questions = data.get('report')

        # Convert user_id to ObjectId
        try:
            user_id = ObjectId(user_id)
        except Exception:
            return jsonify({"error": "Invalid user_id format"}), 400

        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Define file path for the PDF
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        pdf_filename = f"{selected_topic}_interview_report_{user_id}_{timestamp}.pdf"
        file_path = os.path.join("reports/interview", pdf_filename)

        os.makedirs("reports/interview", exist_ok=True)

        score = create_pdf_with_reportlab_interview(questions, file_path, selected_topic)

        mcq_path = os.path.abspath(mcq)
        coding_path = os.path.abspath(code)
        # Combine PDFs
        merger = PdfMerger()

        merger.append(mcq_path)
        merger.append(coding_path)

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        pdf_filename = f"full_mock_report_{user_id}_{timestamp}.pdf"
        file_path = os.path.join("reports/fullMock", pdf_filename)

        # Ensure the "reports" directory exists
        os.makedirs("reports/fullMock", exist_ok=True)

        merger.write(file_path)
        merger.close()

        instance = FullMock(
            userId=user,
            report=file_path 
        )
        instance.save()

        return send_file(file_path, as_attachment=True, download_name='full_mock_report.pdf')

    except Exception as e:
        return jsonify({"error": str(e)}), 500





@mock_route.route('/get_mock_report', methods=['POST'])
def get_mock_report():
    try:
        data = request.json
        print(data)
        mock_path = os.path.abspath(data)

        return send_file(mock_path, as_attachment=True, download_name='mock_report.pdf')

    except Exception as e:
        return jsonify({"error": str(e)}), 500