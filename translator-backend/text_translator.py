import os
from google.oauth2.service_account import Credentials
from google.cloud import translate_v2 as translate

# Set the environment variable for the credentials file path
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = './api-credentials.json'









class TextTranslator:
    def __init__(self) -> None:
        # Create a Credentials object
        self.credentials = Credentials.from_service_account_file('./api-credentials.json')
        # Create a client object for the Translation API using the credentials
        self.translate_client = translate.Client(credentials=self.credentials)


    def translate(self, text, target_lang):
        # Call the API methods
        result = self.translate_client.translate(text, target_language=target_lang)
        return result['translatedText']
    
    def get_supported_languages(self):
        # Call the API methods
        response = self.translate_client.get_languages()
        return response
        

