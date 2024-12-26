// Function to capture the user's selection and send it to the backend
function captureSelection(buttonSelector, userIdKey, questionCategory, questionNumber) {
  const buttons = document.querySelectorAll(buttonSelector); // Select buttons
  const nextBtn = document.getElementById("next-btn"); // Select the "Next" button
  let selectedAnswer = null; // To store the selected answer

  // Add event listeners to the option buttons
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove "selected" class from all buttons
      buttons.forEach((btn) => btn.classList.remove("selected"));

      // Highlight the selected button
      button.classList.add("selected");

      // Enable the "Next" button
      nextBtn.disabled = false;

      // Store the selected answer
      selectedAnswer = button.textContent;
    });
  });

  // Add event listener to the "Next" button
  nextBtn.addEventListener("click", () => {
    if (!selectedAnswer) {
      alert("Please select an option before proceeding.");
      return;
    }

    // Get the userId from localStorage
    const userId = localStorage.getItem(userIdKey);
    if (!userId) {
      alert("User not logged in.");
      return;
    }

    // Prepare the data payload
    const data = {
      userId: userId,
      questionCategory: questionCategory,
      questionNumber: questionNumber,
      selectedAnswer: selectedAnswer,
    };

    // Send the data to the server
    fetch("http://mentorify.ddns.net:3000/save-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          console.log(data.message); // Log success message
        } else {
          alert("Failed to save preference.");
        }
      })
      .catch((error) => {
        console.error("Error saving preference:", error);
      });
  });
}
