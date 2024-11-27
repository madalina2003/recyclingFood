const itemBreakdown = {
    item2: [{ src: "chips.png", type: "compost" }, { src: "cardboard.png", type: "recycle" }],
    item3: [{ src: "chicken.png", type: "compost" }, { src: "wrap.png", type: "trash" }],
    item4: [{ src: "plasticfork.png", type: "recycle" }, { src: "sausage.png", type: "compost" }],
    item5: [{ src: "pasta.png", type: "compost" }, { src: "plasticContainer.png", type: "recycle" }]
};

let correctScore = 0;
let wrongScore = 0;
let timerInterval;
let timeLeft = 120;
let gameStarted = false;
const totalComponents = Object.values(itemBreakdown).flat().length;


function startGame() {
    if (gameStarted) return;
    gameStarted = true;


    document.querySelectorAll(".component").forEach(item => {
        item.setAttribute("draggable", "true");
    });

    // Reset scores and timer
    correctScore = 0;
    wrongScore = 0;
    timeLeft = 120;
    updateScoreboard();
    startTimer();

    alert("Game started! Sort the waste items into the correct bins.");
}

function breakDown(event, itemId) {
    const container = document.getElementById(`${itemId}-container`);
    const componentsDiv = container.querySelector(".components");

    if (!componentsDiv.classList.contains("hidden")) return;

    componentsDiv.innerHTML = "";

    itemBreakdown[itemId].forEach((componentData, index) => {
        const component = document.createElement("img");
        component.classList.add("component");
        component.src = componentData.src;
        component.alt = `Component ${index + 1}`;
        component.style.width = "40px"; // Smaller size
        component.id = `${itemId}-component${index}`;
        component.draggable = true;
        component.dataset.type = componentData.type;
        component.ondragstart = drag;

        componentsDiv.appendChild(component);
    });

    componentsDiv.classList.remove("hidden");
}

function drag(event) {
    event.dataTransfer.setData("id", event.target.id);
    event.dataTransfer.setData("type", event.target.dataset.type);
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const droppedItemId = event.dataTransfer.getData("id");
    const droppedItemType = event.dataTransfer.getData("type");
    const targetBin = event.target.closest(".bin");
    const targetBinType = targetBin ? targetBin.dataset.type : null;

    const droppedItem = document.getElementById(droppedItemId);

    if (!targetBinType) {
        alert("Invalid drop target.");
        return;
    }

    if (droppedItemType === targetBinType) {
        targetBin.appendChild(droppedItem);
        correctScore++;
        checkGameCompletion(); // Check if the game is complete
    } else {
        wrongScore++;
        droppedItem.classList.add("incorrect");
        showWrongModal(droppedItem);
    }

    updateScoreboard();
}

function startTimer() {
    const timerElement = document.getElementById("timer");

    timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `Time Left: ${minutes}:${seconds.toString().padStart(2, "0")}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(timerInterval);
    document.querySelectorAll(".component").forEach(item => item.setAttribute("draggable", "false"));
    showCongratulationsModal();
}

function checkGameCompletion() {
    if (correctScore === totalComponents) {
        clearInterval(timerInterval);
        showCongratulationsModal();
    }
}

function showCongratulationsModal() {
    const totalAnswers = correctScore + wrongScore;
    const percentageCorrect = Math.round((correctScore / totalAnswers) * 100);
    const timeTaken = 120 - timeLeft;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    document.getElementById('results-correct').textContent = correctScore;
    document.getElementById('results-incorrect').textContent = wrongScore;
    document.getElementById('results-percentage').textContent = isNaN(percentageCorrect) ? 0 : percentageCorrect;
    document.getElementById('results-time').textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    const modal = document.getElementById('congratulations-modal');
    modal.style.display = 'block';

    // Attach close button event
    const closeBtn = document.getElementById('close-congratulations-btn');
    closeBtn.onclick = () => {
        modal.style.display = 'none'; // Hide the modal
    };
}


function showWrongModal(droppedItem) {
    const messages = {
        "item2-component0": "Chips belong in the compost bin.",
        "item2-component1": "Cardboard is recyclable.",
        "item3-component0": "Chicken leftovers go in compost.",
        "item3-component1": "Plastic wrap belongs in trash.",
        "item4-component0": "Plastic forks are recyclable.",
        "item4-component1": "Sausages go in compost.",
        "item5-component0": "Pasta belongs in compost.",
        "item5-component1": "Plastic containers are recyclable."
    };

    document.getElementById('wrong-message').textContent = messages[droppedItem.id] || "Incorrect! Try again!";
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
        droppedItem.setAttribute('draggable', 'true');
        droppedItem.classList.remove('incorrect');
    };
}

function updateScoreboard() {
    const scoreElement = document.getElementById("score");
    scoreElement.textContent = `Score: ${correctScore} Correct, ${wrongScore} Wrong`;
}
