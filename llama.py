import json
import requests

# NOTE: ollama must be running for this to work, start the ollama app or run `ollama serve`
model = "llama3.2"  # TODO: update this for whatever model you wish to use


def chat(messages):
    r = requests.post(
        "http://0.0.0.0:11434/api/chat",
        json={"model": model, "messages": messages, "stream": True},
        stream=True
    )
    r.raise_for_status()
    output = ""

    for line in r.iter_lines():
        body = json.loads(line)
        if "error" in body:
            raise Exception(body["error"])
        if body.get("done") is False:
            message = body.get("message", "")
            content = message.get("content", "")
            output += content
            # the response streams one token at a time, print that as we receive it
            print(content, end="", flush=True)

        if body.get("done", False):
            message["content"] = output
            return message


def main():
    messages = [
        {
            "role": "system",
            "content": (
                "You are a chatbot named Mentorify AI, designed to help people learn."
            )
        }
    ]

    while True:
        user_input = input("Enter a prompt: ")
        if not user_input:
            exit()
        print()

        # Add the user's message to the conversation
        messages.append({"role": "user", "content": user_input})

        # Chat with the user prompt
        message = chat(messages)
        messages.append(message)

        print("\n\n")


if __name__ == "__main__":
    main()
