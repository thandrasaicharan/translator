# Import the necessary modules
from flask import Flask, request, jsonify, send_file, redirect, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from datetime import datetime, timedelta
from flask_restx import Api, Resource, fields
from flask_cors import CORS
# from googletrans import Translator
from text_translator import TextTranslator
from google.cloud import speech_v1p1beta1 as speech
import os


# Create the Flask app and set up the database connection
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = "super-secret"  # Change this!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

# Create the SQLAlchemy and Marshmallow instances
db = SQLAlchemy(app)
ma = Marshmallow(app)
cors = CORS(app, resources={r"/*": {"origins": "*"}}, methods=["GET", "POST", "PUT", "DELETE"], headers="*")
# translator = Translator()
translator = TextTranslator()
# Configure Google Cloud credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = './api-credentials.json'

# Create a Speech-to-Text client
client = speech.SpeechClient()

# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String(50), nullable=False)
    lastname = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    source_lang = db.Column(db.String(10), default='en')
    dest_lang = db.Column(db.String(10), default='fr')

    def __repr__(self):
        return f'<User {self.username}>'

# Define the User schema
class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User

# Instantiate the User schema
user_schema = UserSchema()
users_schema = UserSchema(many=True)

# Configure the Flask-JWT-Extended extension
jwt = JWTManager(app)


# Configure the Flask-RESTPlus extension
api = Api(app, title='Translator API', description='API for translator app',security='Bearer Auth',
    authorizations={
        'Bearer Auth': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization'
        }
    })


# Define the data models
user_model = api.model('User', {
    'username': fields.String(required=True, description='The user\'s username'),
    'password': fields.String(required=True, description='The user\'s password'),
})

registration_user_model = api.model('Registration', {
    'username': fields.String(required=True, description='The user\'s username'),
    'password': fields.String(required=True, description='The user\'s password'),
    'firstname': fields.String(required=True, description='The user\'s first name'),
    'lastname': fields.String(required=True, description='The user\'s last name'),
})

preference_model = api.model('Preference', {
    'user_name': fields.String(required=True, description='The username of the user'),
    'source_lang': fields.String(required=False, description='The user\'s new source language'),
    'dest_lang': fields.String(required=False, description='The user\'s new destination language'),
    'new_password': fields.String(required=False, description='The user\'s new password'),
})

translate_model = api.model('Translate', {
    'source_lang': fields.String(required=True, description='source language'),
    'dest_lang': fields.String(required=True, description='destination language'),
    'text': fields.String(required=True, description='The text to be translated'),
})
# Define the audio upload model
audio_upload_model = api.model('AudioUpload', {
    'audio': fields.Raw(required=True, description='Audio file in MP3 format')

})

# Define the transcription response model
transcription_response_model = api.model('TranscriptionResponse', {
    'transcription': fields.String(required=True, description='Transcription of the audio'),
    
})


with app.app_context():
    db.create_all()


@app.route('/translator')
def redirect_to_app():
    return send_file('web/index.html')

@app.route('/')
def index():
    return redirect('/translator')

@app.route('/translator/static/<path:path>')
def serve_static(path):
    print(path)
    return send_from_directory('web/static', path)

@api.route('/login')
class UserLogin(Resource):
    @api.doc(responses={
        200: 'Success',
        401: 'Invalid Login Credentials'
    })
    @api.expect(user_model)
    def post(self):
        """Log in a user"""
        # Get the request data
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        # Query the database for the user
        user = User.query.filter_by(username=username).first()

        # Check if the user exists and the password is correct
        if user and check_password_hash(user.password, password):
            # Create a token for the user
            token = create_access_token(identity=username)
            return {'token': token}

        return {'message': 'Invalid username or password'}, 401


        
@api.route('/preferences')
class UserPreference(Resource):
    @jwt_required()
    @api.response(200, 'Success')
    @api.response(401, 'Unauthorized')
    @api.response(404, 'User not found')
    @api.doc(description='Get user preferences')
    def get(self):
        # Get the current user's preferences
        user_name = get_jwt_identity()
        user = User.query.filter_by(username=user_name).first()
        if user:
            result = user_schema.dump(user)
            return jsonify(result)
        else:
            return {'message': 'User not found'}, 404
        

    @jwt_required()
    @api.expect(preference_model)
    @api.response(200, 'Success')
    @api.response(401, 'Unauthorized')
    @api.response(404, 'User not found')
    @api.response(400, 'Bad Request')
    @api.doc(description='Update user preferences',security='Bearer Auth')
    def put(self):
        user_name = get_jwt_identity()
        # Get the current user's preferences
        user = User.query.filter_by(username=user_name).first()

        if not user:
            return {'message': 'User not found'}, 404

        # Update the user's preferences
        source_lang = request.json.get('source_lang')
        dest_lang = request.json.get('dest_lang')
        new_password = request.json.get('new_password')

        if source_lang:
            user.source_lang = source_lang
        if dest_lang:
            user.dest_lang = dest_lang
        if new_password:
            user.password = generate_password_hash(new_password)

        # Save the updated user
        try:
            db.session.commit()
            return {'message': 'User preferences updated successfully'}
        except IntegrityError:
            db.session.rollback()
            return {'error': 'Username already exists'}, 400

@api.route('/register')
class UserRegistration(Resource):
    @api.doc(responses={
        200: 'Success',
        400: 'Validation Error',
        409: 'Username already exists'
    })
    @api.expect(registration_user_model, validate=True)
    def post(self):
        '''Register a new user'''
        # Get the request data
        data = request.get_json()

        # Check if the username already exists
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user:
            api.abort(409, 'Username already exists')

        # Create a new user
        new_user = User(
            username=data['username'],
            password=generate_password_hash(data['password']),
            firstname=data['firstname'],
            lastname=data['lastname']
        )

        # Add the user to the database
        db.session.add(new_user)
        db.session.commit()

        # Return the new user
        return user_schema.dump(new_user), 200

@api.route('/translate')
class Translate(Resource):
    # @jwt_required()
    @api.doc(responses={
        200: 'Success',
        400: 'Bad Request',
        500: 'Error'
    })
    @api.expect(translate_model, validate=True)
    def post(self):
        # Get the request data
        data = request.get_json()
        text = data.get('text')
        source_lang = data.get('source_lang')
        dest_lang = data.get('dest_lang')

        # Translate the text
        try :
            result = translator.translate(text,target_lang=dest_lang)
        

            # Return the translated text as a JSON response
            return jsonify({'translation': result})
        except:
            return {'message': 'Failed to translate text.'}, 500
        


@api.route('/supported-lang')
class SupportedLang(Resource):
    @jwt_required()
    @api.response(200, 'Success')
    @api.response(401, 'Unauthorized')
    @api.response(500, 'Error')
    @api.doc(description='Get supported languages')
    def get(self):
        # Get the current user's preferences
        user_name = get_jwt_identity()
        user = User.query.filter_by(username=user_name).first()
        if user:
            try:
                langs = translator.get_supported_languages()
                return jsonify(langs)
            except:
                return {'message': 'Failed to get supported languages.'}, 500
        else:
            return {'message': 'User not found'}, 404
        
LANG_DIALECT = {
  "en": "en-US",
  "es": "es-MX",
  "pt": "pt-BR",
  "fr": "fr-FR",
  "de": "de-DE",
  "it": "it-IT",
  "ru": "ru-RU",
  "zh": "zh-CN",
  "ja": "ja-JP",
  "ko": "ko-KR",
  "ar": "ar-SA",
  "tr": "tr-TR",
  "pl": "pl-PL",
  "nl": "nl-NL",
  "sv": "sv-SE",
  "da": "da-DK",
  "no": "no-NO",
  "fi": "fi-FI",
  "hi": "hi-IN",
  "bn": "bn-IN"
}

# Define the endpoint for audio transcription
@api.route('/transcription')
class Transcription(Resource):
    @api.expect(audio_upload_model)
    @api.response(200, 'Success', transcription_response_model)
    @api.response(500, 'Error')
    def post(self):
        # Get the audio file from the request
        audio_file = request.files.get('audio')
        # dest_lang = request.json.get('dest_lang')
        headers = request.headers
        dest_lang = headers.get("X-DestLang", 'en')
        src_lang = headers.get("X-SrcLang", 'en')

        # Set up the transcription request
        audio = speech.RecognitionAudio(content=audio_file.read())
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.MP3,
            sample_rate_hertz=16000,
            language_code=LANG_DIALECT.get(src_lang, 'en-US'),
        )

        # Send the transcription request
        response = client.recognize(config=config, audio=audio)

        try:
            # Extract the transcription from the response
            transcription = response.results[0].alternatives[0].transcript
            result = translator.translate(transcription,target_lang=dest_lang)

        except:
            return {'message': "Faliled to translate try again."}, 500


        # Return the translated text as a response
        return {'translation': result}

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=80)