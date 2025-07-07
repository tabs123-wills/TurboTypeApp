# Upgraded Flask app for Typing Speed Test
from flask import Flask, render_template, request, jsonify
from datetime import datetime
import random
import logging
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for future frontend/backend separation
logging.basicConfig(level=logging.INFO)

# Sample texts for typing test (expanded)
TYPING_TEXTS = [
    "The quick brown fox jumps over the lazy dog.",
    "Programming is the art of telling another human what one wants the computer to do.",
    "Flask is a micro web framework written in Python.",
    "Typing speed is measured in words per minute where a word is considered five characters.",
    "Practice makes perfect when it comes to improving your typing skills.",
    "Debugging is twice as hard as writing the code in the first place.",
    "A journey of a thousand miles begins with a single step.",
    "Artificial Intelligence is the new electricity.",
    "Consistency is the key to mastering any skill.",
    "Python is an interpreted, high-level and general-purpose programming language."
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_text')
def get_text():
    selected = random.choice(TYPING_TEXTS)
    logging.info("Selected text for typing: %s", selected)
    return jsonify({'text': selected})

@app.route('/calculate_wpm', methods=['POST'])
def calculate_wpm():
    try:
        data = request.json
        typed_text = data.get('typed_text', '')
        original_text = data.get('original_text', '')
        start_time = datetime.fromisoformat(data.get('start_time'))

        if not original_text:
            return jsonify({'error': 'Original text is empty'}), 400

        time_taken = (datetime.now() - start_time).total_seconds() / 60
        num_chars = len(typed_text)
        num_words = num_chars / 5
        wpm = num_words / time_taken if time_taken > 0 else 0

        correct_chars = sum(1 for a, b in zip(original_text, typed_text) if a == b)
        accuracy = (correct_chars / len(original_text)) * 100

        result = {
            'wpm': round(wpm, 2),
            'accuracy': round(accuracy, 2),
            'time_taken': round(time_taken * 60, 2)  # seconds
        }

        logging.info("Results calculated: %s", result)
        return jsonify(result)

    except Exception as e:
        logging.error("Error calculating WPM: %s", str(e))
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
