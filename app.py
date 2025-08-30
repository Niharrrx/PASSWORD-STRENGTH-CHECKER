# At the top, add these imports
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import re

# ... (keep the rest of your code)

# Add this new route to serve the homepage
@app.route('/')
def home():
    return render_template('index.html')

# Add these routes to serve your CSS and JS files
@app.route('/style.css')
def serve_css():
    return send_from_directory('.', 'style.css')

@app.route('/script.js')
def serve_js():
    return send_from_directory('.', 'script.js')

# ... (keep your /strength route)

app = Flask(__name__)
CORS(app)

def check_password_strength(password):
    """
    Calculates the strength and provides detailed checks for a password.
    """
    length = len(password)
    checks = {
        'length': length >= 8,
        'lowercase': bool(re.search(r"[a-z]", password)),
        'uppercase': bool(re.search(r"[A-Z]", password)),
        'number': bool(re.search(r"[0-9]", password)),
        'special': bool(re.search(r"[!@#$%^&*(),.?\":{}|<>]", password))
    }
    
    # Calculate score based on the number of passed checks
    score = sum(checks.values())
    
    # Add an extra point for passwords longer than 12 characters
    if length >= 12:
        score += 1

    # Determine feedback message based on score
    if not password:
        feedback = "Enter a password to check its strength."
    elif score <= 2:
        feedback = "Very Weak"
    elif score <= 4:
        feedback = "Medium"
    else:
        feedback = "Strong"
        
    return {'score': score, 'feedback': feedback, 'checks': checks}

@app.route('/strength', methods=['POST'])
def get_strength():
    data = request.get_json()
    password = data.get('password', '')
    result = check_password_strength(password)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)