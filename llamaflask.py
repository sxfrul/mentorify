from flask import Flask, request, jsonify
import json
import requests
from flask_cors import CORS  # Import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

model = "llama3.2"  # Update this for your specific model

# Initialize the conversation with the system message
messages = [
    {
        "role": "system",
        "content": "You are a chatbot named Mentorify AI, designed to help people learn."
    }
]

@app.route('/chat', methods=['POST'])
def chat():
    global messages  # Use the global messages list
    data = request.json
    print("Request received:", data)

    # Extract user message from the request
    user_message = data.get("messages", [{}])[0]  # Get the user's message
    messages.append(user_message)  # Add the user's message to the conversation

    # Prepare the payload for the ollama API
    payload = {
        "model": model,
        "messages": messages,  # Include all messages in the context
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

        # Add the assistant's response to the messages list
        messages.append({"role": "assistant", "content": output.strip()})  # Add the bot's response
        return jsonify({"message": output.strip()}), 200

    except requests.exceptions.RequestException as e:
        print(f"Error during chat: {e}")
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
