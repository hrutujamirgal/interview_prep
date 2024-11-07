from pymongo import MongoClient
from flask import Blueprint, jsonify
from dotenv import load_dotenv
import os

load_dotenv()

get_routes = Blueprint('get_routes', __name__)

#configuring withh the database
client = MongoClient(os.getenv('MONGODB_URI'))
db = client.get_default_database()

@get_routes.route('/get_subjects', methods=['GET'])
def getSubject():
    collection = db['subject']  
    documents = list(collection.find())  
    
    for doc in documents:
        doc['_id'] = str(doc['_id'])
    
    return jsonify({'message': 'Fetch', 'subjects': documents}), 200


@get_routes.route('/get_random_subject', methods=['GET'])
def get_random_subject():
    collection = db['subject']  
    
    random_subject = list(collection.aggregate([{"$sample": {"size": 1}}]))
    
    if random_subject:
        random_subject[0]['_id'] = str(random_subject[0]['_id'])
    
    return jsonify({'message': 'Random subject fetched', 'subject': random_subject[0] if random_subject else None}), 200