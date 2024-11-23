from models import User , MCQModel, CodingModel, Interview
from flask import jsonify, request, send_file, make_response, Blueprint,  session
from functools import wraps
from datetime import datetime
from bson import ObjectId
from reportlab.pdfgen import canvas
import os
from routes.questionGeneration import calculate_similarity_bert
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


interview_route = Blueprint('interview_route', __name__)


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login required'}), 403
        return f(*args, **kwargs)
    return decorated_function



def create_pdf_with_reportlab(data, file_path, topic):
    # A4 page size dimensions
    width, height = A4
    margin = 40  # Margin from edges (top, bottom, left, right)

    # Create the PDF and save it to the specified file path
    p = canvas.Canvas(file_path, pagesize=A4)

    # Title
    p.setFont("Helvetica-Bold", 16)
    p.drawString((width - 300) / 2, height - margin, f"MCQ Test Report on {topic}")
    y_position = height - margin - 40  # Adjust position for title

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

        # Print Answer and Selected Option
        p.drawString(margin, y_position, f"Answer: {question_data['answer']}")
        y_position -= 20
        p.drawString(margin, y_position, f"Selected Option: {question_data['selected_option']}")
        y_position -= 20

        # Calculate and print score for each question
        question_score = 1 if question_data['selected_option'] == question_data['answer'] else 0
        score += question_score
        p.drawString(margin, y_position, f"Score: {question_score}")
        y_position -= 30  # Extra space between questions

        # Start a new page if we reach the bottom
        if y_position < margin:
            p.showPage()
            y_position = height - margin - 40  # Reset y position for new page

    # Print total score at the end
    p.drawString(margin, y_position, f"Total Score: {score}")
    y_position -= 30

    # Finish up the PDF
    p.showPage()
    p.save()

    return score



@interview_route.route('/get_mcq_report', methods=['POST'])
# @login_required
def get_mcq_report():
    try:
        data = request.json
        user_id = data.get('user_id')
        selected_topic = data.get('selectedTopic')
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

        # Ensure the "reports" directory exists
        os.makedirs("reports/mcq", exist_ok=True)

        # Create the PDF and save it to the file path
        score = create_pdf_with_reportlab(questions, file_path, selected_topic)

        # Store the file path in MongoDB (not the PDF content itself)
        mcq_instance = MCQModel(
            userId=user,
            selectedTopic=selected_topic,
            score=score,
            report=file_path  # Save the file path in MongoDB
        )
        mcq_instance.save()

        # Send the PDF file as a downloadable attachment
        return send_file(file_path, as_attachment=True, download_name='mcq_report.pdf')

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



@interview_route.route('/get_coding_report', methods=['POST'])
# @login_required
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
        return send_file(file_path, as_attachment=True, download_name='coding_report.pdf')

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
        correct = calculate_similarity_bert(question_data['userAnswer'], question_data['answer'])
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


@interview_route.route('/get_report', methods=['POST'])
# @login_required
def get_report():
    try:
        data = request.json
        user_id = data.get('user_id')
        selected_topic = data.get('topic')
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

        # Ensure the "reports" directory exists
        os.makedirs("reports/interview", exist_ok=True)

        # Create the PDF and save it to the file path
        score = create_pdf_with_reportlab_interview(questions, file_path, selected_topic)

        print("till here")

        # Store the file path in MongoDB (not the PDF content itself)
        instance = Interview(
            userId=user,
            selectedTopic=selected_topic,
            report=file_path 
        )
        instance.save()

        # Send the PDF file as a downloadable attachment
        return send_file(file_path, as_attachment=True, download_name='interview_report.pdf')

    except Exception as e:
        return jsonify({"error": str(e)}), 500
