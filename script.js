let timeLeft = 3600; // Default: 60 minutes in seconds
let timerInterval;
let currentQuestion = 0;
let answers = {}; // To store selected answers and marked questions

const totalQuestions = 100; // You can set this number to any desired value

// Dynamically generate questions with multiple checkboxes for MCQ and text input
const questions = Array.from({ length: totalQuestions }, (_, i) => ({
    content: `Question ${i + 1}`,
    options: ["A", "B", "C", "D", "E", "F", "G", "H", "I"], // 9 choices for MCQ
}));

// Start the timer
function startTimer() {
    let inputMinutes = document.getElementById('timer-input').value;
    timeLeft = inputMinutes * 60; // Convert minutes to seconds

    document.getElementById('timer').style.display = 'block'; // Show timer
    document.getElementById('timer-setup').style.display = 'none'; // Hide setup

    updateTimer(); // Update timer UI
    timerInterval = setInterval(updateTimer, 1000); // Start the countdown
}

function updateTimer() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    if (seconds < 10) seconds = '0' + seconds;
    document.getElementById('time').textContent = `${minutes}:${seconds}`;
    timeLeft--;

    if (timeLeft < 0) {
        clearInterval(timerInterval);
        alert("Time's up!");
    }
}

// Load a question
function loadQuestion(index) {
    const questionContent = document.getElementById('question-content');
    const questionNumber = document.getElementById('question-number');
    
    questionNumber.textContent = index + 1;

    // Multiple-choice question with text input
    questionContent.innerHTML = `
        <p>${questions[index].content}</p>
        <form id="question-form">
            <!-- Multiple-choice options (checkboxes for multiple selections) -->
            ${questions[index].options.map((option, i) => `
                <label>
                    <input type="checkbox" name="mcq${index}" value="${option}" ${answers[`mcq_${index}`] && answers[`mcq_${index}`].includes(option) ? 'checked' : ''}> ${option}
                </label><br>
            `).join('')}
            
            <!-- Text input -->
            <label for="text-input-${index}">Additional input:</label><br>
            <input type="text" id="text-input-${index}" value="${answers[`text_${index}`] || ''}"><br>
        </form>
    `;

    // Update the "Mark for Review" button if the question is already marked
    const markBtn = document.getElementById('mark-review-btn');
    if (answers[`marked_${index}`]) {
        markBtn.textContent = "Unmark Question";
    } else {
        markBtn.textContent = "Mark for Review";
    }
}

// Navigate between questions
function nextQuestion() {
    saveAnswer(currentQuestion);
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        loadQuestion(currentQuestion);
    }
}

function prevQuestion() {
    saveAnswer(currentQuestion);
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion(currentQuestion);
    }
}

// Save the current answer (multiple selections for MCQ and text input)
function saveAnswer(index) {
    const selectedOptions = Array.from(document.querySelectorAll(`input[name="mcq${index}"]:checked`)).map(option => option.value);
    if (selectedOptions.length > 0) {
        answers[`mcq_${index}`] = selectedOptions; // Store the selected multiple-choice answers as an array
    }

    const textInput = document.getElementById(`text-input-${index}`);
    if (textInput) {
        answers[`text_${index}`] = textInput.value; // Store the text input answer
    }

    updateReviewTable(); // Update the review table each time an answer is saved
}

// Manually mark or unmark the current question
function markQuestion() {
    if (answers[`marked_${currentQuestion}`]) {
        delete answers[`marked_${currentQuestion}`]; // Unmark the question
    } else {
        answers[`marked_${currentQuestion}`] = true; // Mark the question
    }

    saveAnswer(currentQuestion); // Update the review table
    loadQuestion(currentQuestion); // Reload question to update button text
}

// Update the review table based on marked questions
function updateReviewTable() {
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = ''; // Clear the existing list

    Object.keys(answers).forEach((key) => {
        const questionNumber = key.split('_')[1];

        // Check if the question is marked for review
        if (key.startsWith('marked') && answers[key] === true) {
            const status = answers[`mcq_${questionNumber}`] ? 'Answered' : 'Not Answered';

            // Create a new row for each marked question
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${parseInt(questionNumber) + 1}</td>
                <td>${status}</td>
                <td>✔️</td>
                <td><button class="review-button" onclick="goToQuestion(${questionNumber})">Review</button></td>
            `;
            reviewList.appendChild(row);
        }
    });
}

// Function to navigate to a specific question
function goToQuestion(index) {
    currentQuestion = index;
    loadQuestion(currentQuestion); // Reload the question
}

// End Exam and Show Results
function endExam() {
    saveAnswer(currentQuestion); // Save the last selected answer
    clearInterval(timerInterval); // Stop the timer

    const resultsDiv = document.getElementById('results');
    const selectedAnswersDiv = document.getElementById('selected-answers');

    selectedAnswersDiv.innerHTML = Object.keys(answers).map(key => {
        const questionNumber = key.split('_')[1]; // Extract question number

        // Determine which answer type (MCQ or Text) was provided and display it
        if (key.startsWith('mcq') && answers[`mcq_${questionNumber}`].length > 0) {
            return `<p>Question ${parseInt(questionNumber) + 1}: Multiple-choice: ${answers[`mcq_${questionNumber}`].join(', ')}</p>`;
        } else if (key.startsWith('text') && answers[`text_${questionNumber}`]) {
            return `<p>Question ${parseInt(questionNumber) + 1}: Text answer: ${answers[`text_${questionNumber}`]}</p>`;
        }
        return '';
    }).join('');

    resultsDiv.style.display = 'block'; // Show the results section
}

// Load the first question on page load
loadQuestion(currentQuestion);