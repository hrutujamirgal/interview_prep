from mongoengine import connect
import os
from dotenv import load_dotenv



def initialize_db(app):
    load_dotenv()

    mongodb_uri = os.getenv('MONGODB_URI')

    if not mongodb_uri:
        raise ValueError("MONGODB_URI is missing in .env file.")

    app.config['MONGODB_SETTINGS'] = {
        'host': mongodb_uri
    }

    connect(host=app.config['MONGODB_SETTINGS']['host'])
    print("Connected to the Database")

