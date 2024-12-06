from flask import Flask, request, jsonify
import json
import requests
from flask_cors import CORS  # Import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

model = "llama3.2"  # Update this for your specific model

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    print("Request received:", data)

    # Prepare the payload for the ollama API
    payload = {
        "model": model,
        "messages": data.get("messages", []),  # Use the messages from the request
        "stream": True
    }
    print("Payload being sent to ollama:", payload)

    try:
        response = requests.post("http://127.0.0.1:11434/api/chat", json=payload, stream=True)
        response.raise_for_status()  # Raise an error for bad responses

        # Process the response from ollama
        output = ""
        for line in response.iter_lines():
            if line:
                body = json.loads(line)
                if "error" in body:
                    return jsonify({"error": body["error"]}), 400
                if not body.get("done", True):
                    content = body.get("message", {}).get("content", "")
                    output += content

        return jsonify({"message": output}), 200

    except requests.exceptions.RequestException as e:
        print(f"Error during chat: {e}")
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
