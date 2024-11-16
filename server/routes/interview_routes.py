from models import User , MCQModel
from flask import jsonify, request, send_file, make_response, Blueprint,  session
from functools import wraps
from io import BytesIO
from fpdf import FPDF
from mongoengine import Document, StringField, ReferenceField, DateTimeField, IntField, FileField
from datetime import datetime
import base64
from bson import ObjectId
from reportlab.pdfgen import canvas
import os


interview_route = Blueprint('interview_route', __name__)


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login required'}), 403
        return f(*args, **kwargs)
    return decorated_function


# @interview_route.routes('/get_question', methods=['POST'])
# @login_required
# def get_questions():
#     return "the questtiosn for the intterview process"


# @interview_route.route('/get_report', methods=['POST'])
# @login_required
# def get_report():
#     return "send the report in the pdf file format"

# @interview_route.route('/analyze_question', methods=['POST'])
# def analyze_quetion():
#     return "get the video , extract the audio, text to speech, video confidence analysis, for of the report"

from io import BytesIO
from reportlab.pdfgen import canvas
from flask import send_file, request, jsonify
from bson import ObjectId
from datetime import datetime
import os

def create_pdf_with_reportlab(data, file_path):
    # Create the PDF and save it to the specified file path
    p = canvas.Canvas(file_path)

    # Title
    p.setFont("Helvetica-Bold", 14)
    p.drawString(200, 800, "MCQ Test Report")

    y_position = 750
    p.setFont("Helvetica", 12)
    score = 0 

    for question_data in data:
        p.drawString(50, y_position, f"Question: {question_data['question']}")
        y_position -= 20
        for option in question_data["options"]:
            p.drawString(70, y_position, f"Option: {option}")
            y_position -= 20
        # Print answer and selected option
        p.drawString(50, y_position, f"Answer: {question_data['answer']}")
        y_position -= 20
        p.drawString(50, y_position, f"Selected Option: {question_data['selected_option']}")
        y_position -= 20
        # Calculate and print score for each question
        question_score = 1 if question_data['selected_option'] == question_data['answer'] else 0
        score += question_score
        p.drawString(50, y_position, f"Score: {question_score}")
        y_position -= 30  # Extra space between questions

        if y_position < 50:  # Start a new page if we reach the bottom
            p.showPage()
            y_position = 750

    # Print total score at the end
    p.drawString(50, y_position, f"Total Score: {score}")

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
        file_path = os.path.join("reports", pdf_filename)

        # Ensure the "reports" directory exists
        os.makedirs("reports", exist_ok=True)

        # Create the PDF and save it to the file path
        score = create_pdf_with_reportlab(questions, file_path)

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


