from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
import os
from database import initialize_db
from routes.user_routes import user_routes
from routes.get_db_data import get_routes

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')

CORS(app)

initialize_db(app)

# Register routes
app.register_blueprint(user_routes)
app.register_blueprint(get_routes)

@app.route('/')
def index():
    return "MongoDB connected with Flask using MongoEngine"

if __name__ == '__main__':
    app.run(debug=True)
