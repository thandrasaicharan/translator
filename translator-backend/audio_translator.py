from google.cloud import speech_v1p1beta1 as speech
from google.cloud import translate_v2 as translate
import io

# Set up Google Cloud credentials

translate_client = translate.Client.from_service_account_json('path/to/credentials.json')
speech_client = speech.SpeechClient.from_service_account_json('path/to/credentials.json')

# Method to transcribe speech to text
def speech_to_text(audio_file_path, language_code):
    # Load the audio file
    with io.open(audio_file_path, 'rb') as audio_file:
        content = audio_file.read()
 
    audio = speech.types.RecognitionAudio(content=content)

    # Set the language of the audio
    config = speech.types.RecognitionConfig(
        encoding=speech.enums.RecognitionConfig.AudioEncoding.LINEAR16,
        language_code=language_code,
    )

    # Use the Speech-to-Text API to transcribe the audio
    response = speech_client.recognize(config=config, audio=audio)
    transcription = response.results[0].alternatives[0].transcript

    return transcription

# Method to translate text from one language to another
def translate_text(text, source_language, target_language):
    result = translate_client.translate(text, source_language=source_language, target_language=target_language)
    return result['translatedText']

# Example usage
source_language = 'en-US' 
target_language = 'es'
speech_to_translate = 'path/to/audio/file.wav'

# Transcribe the speech to text
transcription = speech_to_text(speech_to_translate, source_language)

# Translate the text to the target language
translated_text = translate_text(transcription, source_language, target_language)

print(f'Translated text: {translated_text}')
