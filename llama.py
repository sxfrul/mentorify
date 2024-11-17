import ollama

print("Chat with Llama3.2! Type 'exit' to end the conversation.\n")

while True:
    # Ask the user for input
    user_message = input("You: ")
    
    # Check if the user wants to exit
    if user_message.lower() == "exit":
        print("Goodbye!")
        break
    
    # Send the user's message to the llama3.2 model
    response = ollama.chat(
        model='llama3.2',
        messages=[{
            'role': 'user',
            'content': user_message
        }]
    )
    
    # Extract and format the assistant's response
    assistant_message = response['message']['content']
    print(f"Assistant: {assistant_message}\n")
