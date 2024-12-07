from flask import Flask, request, Response, jsonify
import json
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

model = "llama3.2"

messages = [
    {
        "role": "system",
        "content": "You are a chatbot named Mentorify AI, designed to help people learn."
    }
]

def generate_response_stream(user_message):
    """
    Generator function to stream AI responses chunk by chunk.
    """
    # Add the user's message to the conversation
    messages.append(user_message)

    # Prepare the payload for the API
    payload = {
        "model": model,
        "messages": messages,
        "stream": True
    }

    try:
        # Make a request to the streaming API
        response = requests.post("http://118.100.221.247:11434/api/chat", json=payload, stream=True)
        response.raise_for_status()

        for line in response.iter_lines():
            if line:
                body = json.loads(line)
                if "error" in body:
                    # Send an error message back if there's an error
                    yield f"data: {json.dumps({'error': body['error']})}\n\n"
                    return
                if not body.get("done", True):
                    # Send chunks of the response message
                    content = body.get("message", {}).get("content", "")
                    # Ensure that the content is JSON-encoded
                    safe_content = content.replace('"', '\\"')  # Escape quotes in content
                    yield f"data: {json.dumps({'message': safe_content})}\n\n"

        # Clear the assistant's messages to keep context small
        messages[:] = messages[:2] + messages[-2:]

    except requests.exceptions.RequestException as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

@app.route('/stream_chat', methods=['GET'])
def stream_chat():
    """
    API endpoint to handle streaming chat responses.
    """
    user_message = {
        "role": "user",
        "content": request.args.get("message", "")
    }
    return Response(generate_response_stream(user_message), content_type='text/event-stream')

if __name__ == '__main__':
    app.run(debug=True)
