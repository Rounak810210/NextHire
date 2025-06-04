from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api, Resource
from dotenv import load_dotenv
import openai
import os
import sqlite3
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from sqlalchemy import func

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5174", "http://localhost:5173"],  # Add both Vite default ports
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///nexthire.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev_jwt_secret_key_12345')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'
app.config['JWT_ERROR_MESSAGE_KEY'] = 'message'

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Add Response model
class Response(db.Model):
    __tablename__ = 'responses'
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    feedback = db.Column(db.Text, nullable=False)
    role = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

# Add Roadmap model
class Roadmap(db.Model):
    __tablename__ = 'roadmaps'
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    topics = db.Column(db.JSON, nullable=False)  # List of topics and their descriptions
    resources = db.Column(db.JSON, nullable=True)  # Optional learning resources
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

# Add MCQ model
class MCQ(db.Model):
    __tablename__ = 'mcqs'
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(50), nullable=False)
    question = db.Column(db.Text, nullable=False)
    options = db.Column(db.JSON, nullable=False)  # List of options
    correct_answer = db.Column(db.String(1), nullable=False)  # A, B, C, or D
    explanation = db.Column(db.Text, nullable=True)
    difficulty = db.Column(db.String(20), nullable=False)  # easy, medium, hard
    topic = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

# Update User model to include responses relationship
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    responses = db.relationship('Response', backref='user', lazy=True)

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# Database setup
def get_db():
    db = sqlite3.connect('nexthire.db')
    db.row_factory = sqlite3.Row
    return db

def init_db():
    with app.app_context():
        # This will create all tables
        db.create_all()
        print("Database tables created successfully!")

# API Resources
class QuestionResource(Resource):
    def get(self):
        role = request.args.get('role', 'SDE')  # Default to SDE if no role specified
        try:
            if not openai.api_key:
                print("OpenAI API key is not configured")
                return {"error": "OpenAI API key is not configured"}, 500

            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{
                    "role": "system",
                    "content": "You are an expert technical interviewer. Generate a challenging interview question."
                }, {
                    "role": "user",
                    "content": f"Generate a medium-level interview question for a {role} role."
                }]
            )
            question = response.choices[0].message.content
            return {"question": question, "role": role}
        except Exception as e:
            error_message = str(e)
            print(f"Error generating question: {error_message}")
            if "api_key" in error_message.lower():
                return {"error": "OpenAI API key is invalid or not configured properly"}, 500
            return {"error": f"Failed to generate question: {error_message}"}, 500

class EvaluateResource(Resource):
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        data = request.get_json()
        question = data.get('question')
        answer = data.get('answer')
        role = data.get('role', 'SDE')

        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{
                    "role": "system",
                    "content": "You are an expert interviewer. Evaluate the candidate's answer."
                }, {
                    "role": "user",
                    "content": f"Question: {question}\nAnswer: {answer}\nRole: {role}\n\nProvide feedback and a score out of 10."
                }]
            )
            feedback = response.choices[0].message.content
            
            # Create new response in database
            new_response = Response(
                question=question,
                answer=answer,
                feedback=feedback,
                role=role,
                user_id=user_id
            )
            db.session.add(new_response)
            db.session.commit()
            
            return {"feedback": feedback}
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

# Register resources
api = Api(app)
api.add_resource(QuestionResource, '/api/questions')
api.add_resource(EvaluateResource, '/api/evaluate')

# Roadmap endpoints
@app.route('/api/roadmap/<role>', methods=['GET'])
def get_roadmap(role):
    try:
        roadmap = Roadmap.query.filter_by(role=role).first()
        if not roadmap:
            return jsonify({'message': 'Roadmap not found'}), 404
        
        return jsonify({
            'id': roadmap.id,
            'role': roadmap.role,
            'title': roadmap.title,
            'description': roadmap.description,
            'topics': roadmap.topics,
            'resources': roadmap.resources
        }), 200
    except Exception as e:
        print(f"Error fetching roadmap: {str(e)}")
        return jsonify({'message': 'Error fetching roadmap'}), 500

# MCQ endpoints
@app.route('/api/mcq/<role>', methods=['GET'])
def get_mcqs(role):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        topic = request.args.get('topic', None)
        difficulty = request.args.get('difficulty', None)
        
        query = MCQ.query.filter_by(role=role)
        
        if topic:
            query = query.filter_by(topic=topic)
        if difficulty:
            query = query.filter_by(difficulty=difficulty)
            
        mcqs = query.paginate(page=page, per_page=per_page)
        
        return jsonify({
            'mcqs': [{
                'id': mcq.id,
                'question': mcq.question,
                'options': mcq.options,
                'topic': mcq.topic,
                'difficulty': mcq.difficulty
            } for mcq in mcqs.items],
            'total': mcqs.total,
            'pages': mcqs.pages,
            'current_page': mcqs.page
        }), 200
    except Exception as e:
        print(f"Error fetching MCQs: {str(e)}")
        return jsonify({'message': 'Error fetching MCQs'}), 500

@app.route('/api/mcq/<role>/topics', methods=['GET'])
def get_mcq_topics(role):
    try:
        topics = db.session.query(MCQ.topic).filter_by(role=role).distinct().all()
        return jsonify({
            'topics': [topic[0] for topic in topics]
        }), 200
    except Exception as e:
        print(f"Error fetching MCQ topics: {str(e)}")
        return jsonify({'message': 'Error fetching topics'}), 500

@app.route('/api/mcq/check/<int:mcq_id>', methods=['POST'])
@jwt_required()
def check_mcq_answer(mcq_id):
    try:
        data = request.get_json()
        user_answer = data.get('answer')
        
        mcq = MCQ.query.get(mcq_id)
        if not mcq:
            return jsonify({'message': 'MCQ not found'}), 404
            
        is_correct = user_answer.upper() == mcq.correct_answer.upper()
        
        return jsonify({
            'correct': is_correct,
            'correct_answer': mcq.correct_answer,
            'explanation': mcq.explanation
        }), 200
    except Exception as e:
        print(f"Error checking MCQ answer: {str(e)}")
        return jsonify({'message': 'Error checking answer'}), 500

@app.route('/api/mcq/generate', methods=['POST'])
@jwt_required()
def generate_mcq():
    try:
        data = request.get_json()
        role = data.get('role')
        topic = data.get('topic')
        
        if not openai.api_key:
            return jsonify({'message': 'OpenAI API key not configured'}), 500

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{
                "role": "system",
                "content": "You are an expert technical interviewer. Generate an MCQ question."
            }, {
                "role": "user",
                "content": f"Generate a challenging MCQ for {role} role about {topic}. Include 4 options, correct answer, and explanation."
            }]
        )
        
        # Process the AI response and format it as an MCQ
        # You'll need to parse the AI response and structure it properly
        
        return jsonify({
            'question': response.choices[0].message.content
        }), 200
    except Exception as e:
        print(f"Error generating MCQ: {str(e)}")
        return jsonify({'message': 'Error generating MCQ'}), 500

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.utcnow()})

# Authentication routes
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    # Validate input
    if not all(k in data for k in ('name', 'email', 'password')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    try:
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 400
        
        # Create new user
        user = User(
            name=data['name'],
            email=data['email'],
            password=generate_password_hash(data['password'])
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error during signup: {str(e)}")
        return jsonify({'message': 'An error occurred during signup'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    print(f"Login attempt for email: {data.get('email')}")
    
    # Validate input
    if not all(k in data for k in ('email', 'password')):
        print("Missing required fields")
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Find user
    user = User.query.filter_by(email=data['email']).first()
    
    # Verify password
    if not user or not check_password_hash(user.password, data['password']):
        print("Invalid email or password")
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Create access token with additional claims
    token_data = {
        'user_id': str(user.id),  # Convert user ID to string
        'email': user.email
    }
    access_token = create_access_token(
        identity=str(user.id),  # Convert user ID to string for the identity
        additional_claims=token_data
    )
    print(f"Generated token for user {user.id}: {access_token}")
    
    response_data = {
        'token': access_token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email
        }
    }
    print(f"Sending login response: {response_data}")
    return jsonify(response_data), 200

@app.route('/api/auth/user', methods=['GET'])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email
    }), 200

# Dashboard endpoints
@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        # Get current user from JWT token and convert to int
        current_user_id = int(get_jwt_identity())
        print(f"Processing dashboard stats request for user {current_user_id}")
        
        if not current_user_id:
            print("No user ID found in token")
            return jsonify({'message': 'Invalid user token'}), 401
        
        # Get total responses
        total_responses = Response.query.filter_by(user_id=current_user_id).count()
        
        # Get responses by role
        role_stats = db.session.query(
            Response.role,
            func.count(Response.id).label('count')
        ).filter_by(user_id=current_user_id).group_by(Response.role).all()
        
        # Get recent activity
        recent_responses = Response.query.filter_by(user_id=current_user_id)\
            .order_by(Response.created_at.desc())\
            .limit(5)\
            .all()
        
        response_data = {
            'total_responses': total_responses,
            'role_stats': [{
                'role': stat.role,
                'count': stat.count
            } for stat in role_stats],
            'recent_activity': [{
                'id': response.id,
                'question': response.question,
                'role': response.role,
                'created_at': response.created_at.isoformat()
            } for response in recent_responses]
        }
        print(f"Sending stats response: {response_data}")
        return jsonify(response_data), 200
    except Exception as e:
        print(f"Error fetching dashboard stats: {str(e)}")
        return jsonify({'message': 'Error fetching dashboard statistics'}), 500

@app.route('/api/dashboard/responses', methods=['GET'])
@jwt_required()
def get_user_responses():
    # Convert string user ID to int
    user_id = int(get_jwt_identity())
    print(f"Fetching responses for user {user_id}")
    print(f"Request headers: {dict(request.headers)}")
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    role = request.args.get('role', None)
    
    try:
        query = Response.query.filter_by(user_id=user_id)
        
        if role:
            query = query.filter_by(role=role)
        
        responses = query.order_by(Response.created_at.desc())\
            .paginate(page=page, per_page=per_page)
        
        response_data = {
            'responses': [{
                'id': response.id,
                'question': response.question,
                'answer': response.answer,
                'feedback': response.feedback,
                'role': response.role,
                'created_at': response.created_at.isoformat()
            } for response in responses.items],
            'total': responses.total,
            'pages': responses.pages,
            'current_page': responses.page
        }
        print(f"Sending responses response: {response_data}")
        return jsonify(response_data), 200
    except Exception as e:
        print(f"Error fetching user responses: {str(e)}")
        return jsonify({'message': 'Error fetching responses'}), 500

# JWT error handlers with detailed logging
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print(f"Token expired - Header: {jwt_header}, Payload: {jwt_payload}")
    return jsonify({
        'status': 401,
        'message': 'The token has expired'
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"Invalid token error: {error}")
    return jsonify({
        'status': 422,
        'message': f'Invalid token: {error}'
    }), 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"Missing token error: {error}")
    return jsonify({
        'status': 401,
        'message': f'Missing authorization token: {error}'
    }), 401

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    print(f"Checking if token is revoked - Header: {jwt_header}, Payload: {jwt_payload}")
    return False

@app.before_request
def log_request_info():
    if request.path.startswith('/api/'):
        print("\n=== Request Info ===")
        print(f"Path: {request.path}")
        print(f"Method: {request.method}")
        print(f"Headers: {dict(request.headers)}")
        if request.is_json:
            print(f"JSON Data: {request.get_json()}")
        print("==================\n")

# User profile endpoints
@app.route('/api/user/profile', methods=['GET', 'PUT'])
@jwt_required()
def user_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    if request.method == 'GET':
        return jsonify({
            'id': user.id,
            'name': user.name,
            'email': user.email
        }), 200
    
    elif request.method == 'PUT':
        data = request.get_json()
        
        if 'name' in data:
            user.name = data['name']
            
        try:
            db.session.commit()
            return jsonify({
                'message': 'Profile updated successfully',
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email
                }
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': 'Error updating profile'}), 500

@app.route('/api/user/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    
    if not all(k in data for k in ('currentPassword', 'newPassword')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if not check_password_hash(user.password, data['currentPassword']):
        return jsonify({'message': 'Current password is incorrect'}), 401
    
    try:
        user.password = generate_password_hash(data['newPassword'])
        db.session.commit()
        return jsonify({'message': 'Password updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating password'}), 500

@app.route('/api/user/details', methods=['GET'])
@jwt_required()
def get_user_details():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        # Get total responses count
        total_responses = Response.query.filter_by(user_id=user_id).count()
        
        # Get responses by role
        role_stats = db.session.query(
            Response.role,
            func.count(Response.id).label('count')
        ).filter_by(user_id=user_id).group_by(Response.role).all()
        
        # Get latest response date
        latest_response = Response.query.filter_by(user_id=user_id)\
            .order_by(Response.created_at.desc()).first()
            
        # Get average feedback scores (assuming feedback contains a score)
        recent_responses = Response.query.filter_by(user_id=user_id)\
            .order_by(Response.created_at.desc())\
            .limit(5)\
            .all()
        
        return jsonify({
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'joined_date': user.created_at.isoformat() if hasattr(user, 'created_at') else None,
            },
            'stats': {
                'total_responses': total_responses,
                'roles_practiced': [{'role': stat.role, 'count': stat.count} for stat in role_stats],
                'latest_practice': latest_response.created_at.isoformat() if latest_response else None,
                'recent_responses': [{
                    'question': resp.question,
                    'role': resp.role,
                    'created_at': resp.created_at.isoformat()
                } for resp in recent_responses]
            }
        }), 200
        
    except Exception as e:
        print(f"Error fetching user details: {str(e)}")
        return jsonify({'message': 'Error fetching user details'}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True)