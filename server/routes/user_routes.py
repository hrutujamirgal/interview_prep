from flask import Blueprint, jsonify, request, session
from models import User

user_routes = Blueprint('user_routes', __name__)

@user_routes.route('/register', methods=['POST'])
def register():
    data = request.json
    user = User(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        collegeName=data['collegeName']
    )
    user.set_password(data['password'])
    user.save()
    user_dict = user.to_mongo().to_dict()
    session['user_id'] = str(user_dict['_id'])
    return jsonify({
    'message': "User added successfully",
    'user': {
        'id': str(user_dict['_id']),  
        'username': user_dict['username']
    }
    }), 201



@user_routes.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.objects(username=data['username']).first()
    if user:
        
        if user.check_password(data['password']):
            user_dict = user.to_mongo().to_dict()
            session['user_id'] = str(user_dict['_id'])
            return jsonify({'message':"User logged in successfully", 'user': {'id': str(user_dict['_id']),  
        'username': user_dict['username']}}), 200
        else:
            return jsonify(message="Invalid password"), 401
    else:
        return jsonify(message="User not found"), 404

