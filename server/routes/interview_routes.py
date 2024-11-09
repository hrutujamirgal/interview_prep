from models import User , MCQModel
from flask import jsonify, request, send_file, make_response, Blueprint,  session
from functools import wraps
from io import BytesIO
from fpdf import FPDF
from mongoengine import Document, StringField, ReferenceField, DateTimeField, IntField, FileField
from datetime import datetime
import base64


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




class PDF(FPDF):
    def header(self):
        self.set_font("Arial", "B", 12)
        self.cell(0, 10, "MCQ Test Report", 0, 1, "C")

    def add_question(self, question_data):
        self.set_font("Arial", "", 12)
        self.cell(0, 10, f"Question: {question_data['question']}", 0, 1)
        for option in question_data["options"]:
            self.cell(0, 10, f"Option: {option}", 0, 1)
        self.cell(0, 10, f"Answer: {question_data['answer']}", 0, 1)
        self.cell(0, 10, f"Selected Option: {question_data['selected_option']}", 0, 1)
        self.ln(5)


@interview_route.route('/get_mcq_report', methods=['POST'])
@login_required
def get_mcq_report():
    data = request.json
    
    # Extract data
    user_id = data.get("userId")
    selected_topic = data.get("selectedTopic")
    score = data.get("score")
    questions = data.get("questions")
    
    # Verify user
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Create PDF
    pdf = PDF()
    pdf.add_page()
    for question_data in questions.values():
        pdf.add_question(question_data)

    # Save PDF to a buffer
    pdf_buffer = BytesIO()
    pdf.output(pdf_buffer)
    pdf_buffer.seek(0)

    # Save PDF as base64 for MongoDB
    pdf_base64 = base64.b64encode(pdf_buffer.read()).decode("utf-8")
    pdf_buffer.seek(0) 

    # Save to MongoDB
    mcq_instance = MCQModel(
        userId=user,
        selectedTopic=selected_topic,
        score=score,
        report=pdf_base64
    )
    mcq_instance.save()

    # Send PDF to frontend
    response = make_response(pdf_buffer.read())
    response.headers.set('Content-Disposition', 'attachment', filename='mcq_report.pdf')
    response.headers.set('Content-Type', 'application/pdf')

    return response



@interview_route.route('/download_mcq_report/<report_id>', methods=['GET'])
@login_required
def download_mcq_report(report_id):
    mcq_instance = MCQModel.objects(id=report_id).first()
    if not mcq_instance or not mcq_instance.report:
        return jsonify({"error": "Report not found"}), 404

    # Decode the base64 PDF data
    pdf_data = base64.b64decode(mcq_instance.report)
    pdf_buffer = BytesIO(pdf_data)

    # Send PDF to frontend
    response = make_response(pdf_buffer.read())
    response.headers.set('Content-Disposition', 'attachment', filename='mcq_report.pdf')
    response.headers.set('Content-Type', 'application/pdf')

    return response
