from flask import Flask, request, jsonify
import json
import requests

app = Flask(__name__)

# AI Chat Function
model = "llama3.2"  # Update to your desired model


def chat(messages):
    r = requests.post(
        "http://127.0.0.1:11434/api/chat",
        json={"model": model, "messages": messages, "stream": False},  # Change stream to False for simplicity
    )
    r.raise_for_status()
    response = r.json()
    if "error" in response:
        raise Exception(response["error"])
    return response["message"]["content"]


@app.route("/chat", methods=["POST"])
def chat_endpoint():
    try:
        data = request.json
        messages = data.get("messages", [])
        response = chat(messages)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)
