from mongoengine import connect
import os
from dotenv import load_dotenv

def initialize_db(app):
    load_dotenv()

    app.config['MONGODB_SETTINGS'] = {
        'host': os.getenv('MONGODB_URI')  
    }

    connect(host=app.config['MONGODB_SETTINGS']['host'])
    print("Connected to the Database")