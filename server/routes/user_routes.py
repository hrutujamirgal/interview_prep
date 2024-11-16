from flask import Blueprint, jsonify, request, session
from models import User
from mongoengine.errors import ValidationError, NotUniqueError

user_routes = Blueprint('user_routes', __name__)

@user_routes.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not all(key in data for key in ('username', 'email', 'password', 'collegeName')):
            return jsonify({'message': 'Missing required fields'}), 400

        # Create user instance
        user = User(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            collegeName=data['collegeName']
        )

        # Set hashed password and save user
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

    except NotUniqueError:
        return jsonify({'message': 'Username or email already exists'}), 409
    except ValidationError as e:
        return jsonify({'message': 'Validation error', 'error': str(e)}), 400
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({'message': 'An unexpected error occurred', 'error': str(e)}), 500


@user_routes.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not all(key in data for key in ('username', 'password')):
            return jsonify({'message': 'Missing required fields'}), 400

        # Find user by username
        user = User.objects(username=data['username']).first()

        if user:
            if user.check_password(data['password']):
                user_dict = user.to_mongo().to_dict()
                session['user_id'] = str(user_dict['_id'])
                
                return jsonify({
                    'message': "User logged in successfully",
                    'user': {
                        'id': str(user_dict['_id']),
                        'username': user_dict['username']
                    }
                }), 200
            else:
                return jsonify({'message': "Invalid password"}), 401
        else:
            return jsonify({'message': "User not found"}), 404

    except ValidationError as e:
        return jsonify({'message': 'Validation error', 'error': str(e)}), 400
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({'message': 'An unexpected error occurred', 'error': str(e)}), 500
