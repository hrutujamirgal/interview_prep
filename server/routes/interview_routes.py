from flask import Blueprint, jsonify, session
from functools import wraps

interview_routes = Blueprint('interview_routes', __name__)


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login required'}), 403
        return f(*args, **kwargs)
    return decorated_function


@interview_routes.routes('/get_question', methods=['POST'])
@login_required
def get_questions():
    return "the questtiosn for the intterview process"


@interview_routes.route('/get_report', methods=['POST'])
@login_required
def get_report():
    return "send the report in the pdf file format"

@interview_routes.route('/analyze_question', methods=['POST'])
def analyze_quetion():
    return "get the video , extract the audio, text to speech, video confidence analysis, for of the report"