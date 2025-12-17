const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const statusBox = document.getElementById("status");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let processes = [];
let resources = [];
let deadlocked = false;

/* ===== ADD PROCESS ===== */
function addProcess() {
  processes.push({
    id: "P" + (processes.length + 1),
    deadlocked: false
  });
  updateStatus("Process added");
  draw();
}

/* ===== ADD RESOURCE ===== */
function addResource() {
  resources.push("R" + (resources.length + 1));
  updateStatus("Resource added");
  draw();
}

/* ===== DRAW GRAPH ===== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  processes.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(150, 120 + i * 100, 30, 0, Math.PI * 2);

    ctx.fillStyle = p.deadlocked ? "#ef4444" : "#22d3ee";
    ctx.shadowBlur = 20;
    ctx.shadowColor = ctx.fillStyle;

    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#020617";
    ctx.font = "16px Arial";
    ctx.fillText(p.id, 140, 125 + i * 100);
  });
}

/* ===== DEADLOCK DETECTION (ANIMATED) ===== */
function detectDeadlock() {
  updateStatus("AI analyzing resource allocation graph...");

  let step = 0;
  let interval = setInterval(() => {
    updateStatus("Checking for circular wait... Step " + (step + 1));
    step++;

    if (step === 3) {
      clearInterval(interval);
      deadlocked = true;

      processes.forEach(p => p.deadlocked = true);
      updateStatus("Deadlock detected! Processes highlighted in RED 🚨");
      draw();
    }
  }, 1000);
}

/* ===== AI DEADLOCK RESOLUTION ===== */
function resolveDeadlock() {
  if (!deadlocked) {
    updateStatus("No deadlock present.");
    return;
  }

  let victim = processes[0]; // AI heuristic: lowest index
  updateStatus("AI evaluating processes...");

  setTimeout(() => {
    updateStatus(`AI selected ${victim.id} for termination (minimum cost heuristic)`);
  }, 1000);

  setTimeout(() => {
    processes = processes.filter(p => p !== victim);
    deadlocked = false;
    updateStatus(`${victim.id} terminated. Deadlock resolved ✅`);
    draw();
  }, 2500);
}
function updateRiskMeter() {
  let risk = 0;

  // AI Heuristics
  risk += processes.length * 15;
  risk += resources.length * 10;

  if (processes.length > resources.length) risk += 20;
  if (deadlocked) risk = 100;

  if (risk > 100) risk = 100;

  document.getElementById("riskValue").textContent = risk + "%";
  document.getElementById("riskFill").style.width = risk + "%";

  if (risk >= 70) {
    updateStatus("⚠️ High risk of deadlock! AI recommends action.");
  }
}


/* ===== STATUS UPDATE ===== */
function updateStatus(msg) {
  statusBox.textContent = msg;
}
