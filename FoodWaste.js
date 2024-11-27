let score = 0;
let wrongAnswers = 0;
let itemsPlaced = 0;
let totalItems = document.querySelectorAll('.item').length;
let isTimerRunning = false;
let timeLeft = 120; // Time in seconds
let timerInterval = null;

// Start the timer
function startTimer() {
  const timerElement = document.getElementById('timer');
  if (timerInterval) clearInterval(timerInterval); // Ensure no duplicate timers
  isTimerRunning = true;

  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerElement.textContent = `Time Left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      stopTimer();
      disableItems(); // Disable dragging when the timer stops
      showGameOverModal();
    }
  }, 1000);
}

// Stop the timer
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isTimerRunning = false;
}

// Disable all items
function disableItems() {
  document.querySelectorAll('.item').forEach(item => {
    item.setAttribute('draggable', 'false');
  });
}

// Start the game
function startGame() {
  document.getElementById('start-container').style.display = 'none';
  document.getElementById('game-info').style.display = 'block';
  document.getElementById('game-content').style.display = 'block';

  if (document.title.includes("Level 2")) {
    initializeLevel2(); // Initialize Level 2-specific logic
  } else {
    resetGame(); // Reset the game only for Level 1
  }

  startTimer(); // Start fresh timer
}

// Reset the game (for Level 1 only)
function resetGame() {
  score = 0;
  wrongAnswers = 0;
  itemsPlaced = 0;
  timeLeft = 120;

  document.getElementById('score').textContent = `Score: 0 Correct, 0 Wrong`;
  document.getElementById('timer').textContent = `Time Left: 2:00`;

  document.querySelectorAll('.item').forEach(item => {
    item.style.display = 'inline-block';
    item.setAttribute('draggable', 'true');
    item.classList.remove('processed', 'incorrect');
  });

  stopTimer(); // Ensure no old timer runs
}

// Drag and Drop Handlers
function drag(event) {
  if (!isTimerRunning) {
    event.preventDefault();
    return;
  }

  const draggedElement = event.target.closest('.item');
  if (draggedElement) {
    event.dataTransfer.setData('id', draggedElement.id);
    event.dataTransfer.setData('type', draggedElement.dataset.type);
  }
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  event.stopPropagation();

  const itemId = event.dataTransfer.getData('id');
  const itemType = event.dataTransfer.getData('type');
  const droppedItem = document.getElementById(itemId);
  const targetBin = event.target.closest('.bin');

  if (droppedItem.classList.contains('processed') || droppedItem.classList.contains('incorrect')) {
    return; // Prevent duplicate processing
  }

  if (targetBin && targetBin.id === `${itemType}-bin`) {
    droppedItem.style.display = 'none';
    droppedItem.classList.add('processed');
    score++;
    itemsPlaced++;
    document.getElementById('score').textContent = `Score: ${score} Correct, ${wrongAnswers} Wrong`;

    if (itemsPlaced === totalItems) {
      stopTimer();
      saveGameState();
      showCongratulationsModal();
    }
  } else {
    // Incorrect placement
    droppedItem.classList.add('incorrect');
    wrongAnswers++;
    document.getElementById('score').textContent = `Score: ${score} Correct, ${wrongAnswers} Wrong`;
    showWrongModal(droppedItem);

    // Re-enable dragging after a timeout
    setTimeout(() => {
      droppedItem.classList.remove('incorrect'); // Remove incorrect marker
      droppedItem.setAttribute('draggable', 'true'); // Allow dragging again
    }, 3000); // Adjust timeout to match modal display time
  }
}


// Save game state to localStorage
function saveGameState() {
  localStorage.setItem('score', score);
  localStorage.setItem('wrongAnswers', wrongAnswers);
  localStorage.setItem('timeLeft', timeLeft);
}

// Load game state from localStorage
function loadGameState() {
  score = parseInt(localStorage.getItem('score') || '0', 10);
  wrongAnswers = parseInt(localStorage.getItem('wrongAnswers') || '0', 10);
  timeLeft = parseInt(localStorage.getItem('timeLeft') || '120', 10);

  document.getElementById('score').textContent = `Score: ${score} Correct, ${wrongAnswers} Wrong`;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById('timer').textContent = `Time Left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Initialize Level 2
function initializeLevel2() {
  loadGameState();

  document.querySelectorAll('.item').forEach(item => {
    const newItem = item.cloneNode(true); // Clone to reset listeners
    item.parentNode.replaceChild(newItem, item);
    newItem.addEventListener('dragstart', drag);
    newItem.classList.remove('processed', 'incorrect');
    newItem.style.display = 'inline-block';
  });

  stopTimer(); // Ensure no old timer runs
}

// Show Modals
function showCongratulationsModal() {
  const isLevel2 = document.title.includes("Level 2");

  if (isLevel2) {
    const totalAnswers = score + wrongAnswers;
    const percentageCorrect = Math.round((score / totalAnswers) * 100);
    const timeTaken = 120 - timeLeft;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    document.getElementById('results-correct').textContent = score;
    document.getElementById('results-incorrect').textContent = wrongAnswers;
    document.getElementById('results-percentage').textContent = isNaN(percentageCorrect) ? 0 : percentageCorrect;
    document.getElementById('results-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Add Play Again button for Level 2
    const modal = document.getElementById('congratulations-modal');
    const playAgainButton = document.createElement('button');
    playAgainButton.textContent = 'Play Again';
    playAgainButton.onclick = () => {
      localStorage.clear(); // Clear saved game state
      window.location.href = 'foodwaste.html'; // Redirect to Level 1
    };
    modal.appendChild(playAgainButton);
  } else {
    document.getElementById('congratulations-modal').querySelector('h2').textContent = 'Congratulations!';
    document.getElementById('congratulations-modal').querySelector('p').textContent = 'You completed Level 1! Are you ready for Level 2?';
  }

  document.getElementById('congratulations-modal').style.display = 'block';
}


function showWrongModal(droppedItem) {
const messages = {
  item1: "Bananas are organic waste. Place them in the compost bin. They decompose naturally and enrich the soil.",
  item2: "Juice boxes go in the trash bin. They are made of mixed materials that are not recyclable.",
  item3: "Bread is compostable. It breaks down easily and adds nutrients to compost.",
  item4: "Cardboard is recyclable. Recycling it saves energy and reduces waste in landfills.",
  item5: "Oranges belong in the compost bin. They add valuable organic matter to the compost.",
  item6: "Plastic forks go in the recycle bin. Recycling them reduces the need for new plastic production.",
};


  const wrongMessage = document.getElementById('wrong-message');
  wrongMessage.textContent = messages[droppedItem.id] || "Incorrect! Try again.";

  const wrongModal = document.getElementById('wrong-modal');
  wrongModal.style.display = 'block';

  const closeBtn = document.getElementById('close-wrong-btn');
  let countdown = 6;
  closeBtn.textContent = `× (${countdown}s)`;
  closeBtn.disabled = true;

  const countdownInterval = setInterval(() => {
    countdown--;
    closeBtn.textContent = `× (${countdown}s)`;

    if (countdown === 0) {
      clearInterval(countdownInterval);
      closeBtn.disabled = false;
      closeBtn.textContent = "×";
    }
  }, 1000);

  closeBtn.onclick = () => {
    wrongModal.style.display = 'none';
    droppedItem.setAttribute('draggable', 'true'); // Re-enable dragging
    droppedItem.classList.remove('incorrect'); // Remove incorrect class
  };
}


// Event Listeners
document.getElementById('start-button').addEventListener('click', startGame);

document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('dragstart', drag);
});

document.querySelectorAll('.bin').forEach(bin => {
  bin.addEventListener('dragover', allowDrop);
  bin.addEventListener('drop', drop);
});

document.addEventListener('DOMContentLoaded', () => {
  if (document.title.includes("Level 2")) {
    initializeLevel2();
    startTimer();
  }
});
