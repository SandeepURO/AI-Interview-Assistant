from flask import Flask, jsonify
from flask_cors import CORS
from questions import questions_db

app = Flask(__name__)
CORS(app)

@app.route("/questions/<role>")
def get_questions(role):
    questions = questions_db.get(role, [])

    return jsonify({
        "questions": questions
    })

if __name__ == "__main__":
    app.run(debug=True)
