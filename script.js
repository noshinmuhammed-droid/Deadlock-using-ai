const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
const statusBox = document.getElementById("status");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let processes = [];
let resources = [];
let edges = []; // process-resource connections
let deadlocked = false;

// ===== LEARNING AI MEMORY =====
let aiMemory = {
  greedyFailures: 0,
  aggressiveFailures: 0,
  totalDeadlocks: 0
};

const personalities = ["Cooperative", "Aggressive", "Greedy", "Patient"];

/* ===== ADD PROCESS ===== */
function addProcess() {
  const personality =
    personalities[Math.floor(Math.random() * personalities.length)];

  processes.push({
    id: "P" + (processes.length + 1),
    personality,
    deadlocked: false
  });

  updateStatus(`Process added (${personality})`);
  autoConnect();
  draw();
  updateRiskMeter();
}

/* ===== ADD RESOURCE ===== */
function addResource() {
  resources.push({
    id: "R" + (resources.length + 1)
  });

  updateStatus("Resource added");
  autoConnect();
  draw();
  updateRiskMeter();
}

/* ===== AUTO CREATE ALLOCATION EDGES ===== */
function autoConnect() {
  edges = [];
  processes.forEach(p => {
    if (resources.length > 0) {
      const r =
        resources[Math.floor(Math.random() * resources.length)];
      edges.push({ process: p.id, resource: r.id });
    }
  });
}

/* ===== DRAW GRAPH ===== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw edges
  edges.forEach((e, i) => {
    const pIndex = processes.findIndex(p => p.id === e.process);
    const rIndex = resources.findIndex(r => r.id === e.resource);

    if (pIndex === -1 || rIndex === -1) return;

    const px = 150;
    const py = 120 + pIndex * 100;
    const rx = canvas.width - 200;
    const ry = 120 + rIndex * 100;

    ctx.beginPath();
    ctx.moveTo(px + 30, py);
    ctx.lineTo(rx - 30, ry);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw processes
  processes.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(150, 120 + i * 100, 30, 0, Math.PI * 2);

    ctx.fillStyle = p.deadlocked ? "#ef4444" : "#22d3ee";
    ctx.shadowBlur = 15;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#020617";
    ctx.font = "15px Arial";
    ctx.fillText(p.id, 140, 125 + i * 100);

    ctx.font = "11px Arial";
    ctx.fillText(p.personality, 115, 155 + i * 100);
  });

  // Draw resources
  resources.forEach((r, i) => {
    ctx.beginPath();
    ctx.rect(canvas.width - 230, 95 + i * 100, 60, 60);

    ctx.fillStyle = "#a855f7";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#a855f7";
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#020617";
    ctx.font = "14px Arial";
    ctx.fillText(r.id, canvas.width - 215, 130 + i * 100);
  });
}

/* ===== DEADLOCK DETECTION ===== */
function detectDeadlock() {
  if (deadlocked) {
    updateStatus("Deadlock already detected.");
    return;
  }

  if (processes.length < 2 || resources.length < 2) {
    updateStatus("❌ Deadlock not possible (need ≥ 2 processes & resources)");
    return;
  }

  updateStatus("AI analyzing resource allocation graph...");
  let step = 0;

  const interval = setInterval(() => {
    updateStatus("Detecting circular wait... Step " + (step + 1));
    step++;

    if (step === 3) {
      clearInterval(interval);
      deadlocked = true;

      processes.forEach(p => (p.deadlocked = true));
      updateStatus("🚨 Deadlock detected!");
      draw();
      updateRiskMeter();
    }
  }, 1000);
}

/* ===== AI DEADLOCK RESOLUTION (LEARNING) ===== */
function resolveDeadlock() {
  if (!deadlocked) {
    updateStatus("No deadlock present.");
    return;
  }

  updateStatus("AI reasoning using past experience...");

  let victim = processes.reduce((a, b) =>
    getRiskScore(a) > getRiskScore(b) ? a : b
  );

  setTimeout(() => {
    updateStatus(
      `AI terminated ${victim.id} (${victim.personality})`
    );
  }, 1000);

  setTimeout(() => {
    learnFromDeadlock(victim);

    processes = processes.filter(p => p !== victim);
    deadlocked = false;
    processes.forEach(p => (p.deadlocked = false));

    updateStatus("Deadlock resolved using learned behavior ✅");
    autoConnect();
    draw();
    updateRiskMeter();
  }, 2500);
}

/* ===== LEARNING FUNCTION ===== */
function learnFromDeadlock(victim) {
  aiMemory.totalDeadlocks++;

  if (victim.personality === "Greedy") aiMemory.greedyFailures++;
  if (victim.personality === "Aggressive") aiMemory.aggressiveFailures++;
}

/* ===== AI RISK SCORE (ADAPTIVE) ===== */
function getRiskScore(p) {
  let base = 0;

  switch (p.personality) {
    case "Greedy": base = 4; break;
    case "Aggressive": base = 3; break;
    case "Patient": base = 2; break;
    case "Cooperative": base = 1; break;
  }

  // Learning adjustment
  if (p.personality === "Greedy")
    base += aiMemory.greedyFailures * 0.5;

  if (p.personality === "Aggressive")
    base += aiMemory.aggressiveFailures * 0.4;

  return base;
}

/* ===== DEADLOCK RISK PREDICTION ===== */
function updateRiskMeter() {
  let risk = 0;

  processes.forEach(p => {
    risk += getRiskScore(p) * 10;
  });

  risk += resources.length * 5;

  if (deadlocked) risk = 100;
  if (risk > 100) risk = 100;

  document.getElementById("riskValue").textContent = risk + "%";
  document.getElementById("riskFill").style.width = risk + "%";

  if (risk >= 70 && !deadlocked) {
    statusBox.textContent =
      "⚠️ AI Warning: Learned high-risk deadlock pattern detected";
  }
}

/* ===== STATUS UPDATE ===== */
function updateStatus(msg) {
  statusBox.textContent = msg;
}
