let timer;
let timeLeft = 60;
let score = 0;
let accuracy = 0;

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function showMainMenu() {
  showScreen('mainMenu');
}

function startGame() {
  score = 0;
  timeLeft = 60;
  accuracy = 0;
  document.getElementById("score").textContent = score;
  document.getElementById("accuracy").textContent = "-";
  document.getElementById("time").textContent = "01:00";
  showScreen('gameScreen');
  startTimer();
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    let m = Math.floor(timeLeft / 60);
    let s = timeLeft % 60;
    document.getElementById("time").textContent = `${m}:${s.toString().padStart(2, '0')}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

function endGame() {
  showScreen('summaryScreen');
  const accuracyPercent = Math.floor(Math.random() * 100);
  const points = score * accuracyPercent;
  document.getElementById("sumScore").textContent = score;
  document.getElementById("sumAccuracy").textContent = accuracyPercent + "%";
  document.getElementById("sumPoints").textContent = points;
}