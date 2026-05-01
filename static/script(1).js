/* ═══════════════════════════════════════════════════════════════
   GPA Algérien LMD — script.js
   Real-time calculation · Dynamic rows · Presets · Gauge
   ═══════════════════════════════════════════════════════════════ */

"use strict";

// ── State ──────────────────────────────────────────────────────
let rowCounter   = 0;
let currentSem   = "S1";
let globalPreset = { exam: 60, td: 40 };

// Pre-loaded semester templates (typical ST/SM/MI modules)
const SEM_TEMPLATES = {
  S1: [
    { name: "Analyse 1",            exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "Algèbre 1",            exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "Physique 1",           exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "Chimie",               exam: "", td: "", ep: 60, tp: 40, coef: 2 },
    { name: "Informatique 1",       exam: "", td: "", ep: 67, tp: 33, coef: 2 },
    { name: "TP Physique",          exam: "", td: "", ep:  0, tp:100, coef: 1 },
    { name: "Langue Française",     exam: "", td: "", ep:100, tp:  0, coef: 1 },
  ],
  S2: [
    { name: "Analyse 2",            exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "Algèbre 2",            exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "Physique 2",           exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "Thermodynamique",      exam: "", td: "", ep: 60, tp: 40, coef: 2 },
    { name: "Informatique 2",       exam: "", td: "", ep: 67, tp: 33, coef: 2 },
    { name: "TP Chimie",            exam: "", td: "", ep:  0, tp:100, coef: 1 },
    { name: "Langue Anglaise",      exam: "", td: "", ep:100, tp:  0, coef: 1 },
  ],
  S3: [
    { name: "Analyse 3",            exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "Probabilités",         exam: "", td: "", ep: 60, tp: 40, coef: 2 },
    { name: "Physique 3",           exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "Résistance Matériaux", exam: "", td: "", ep: 60, tp: 40, coef: 2 },
    { name: "Électronique 1",       exam: "", td: "", ep: 60, tp: 40, coef: 2 },
    { name: "TP Électronique",      exam: "", td: "", ep:  0, tp:100, coef: 1 },
    { name: "Algorithmique",        exam: "", td: "", ep: 67, tp: 33, coef: 2 },
  ],
  S4: [
    { name: "Analyse Numérique",    exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "Électromagnétisme",    exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "Électronique 2",       exam: "", td: "", ep: 60, tp: 40, coef: 2 },
    { name: "Automatique 1",        exam: "", td: "", ep: 60, tp: 40, coef: 2 },
    { name: "TP Automatique",       exam: "", td: "", ep:  0, tp:100, coef: 1 },
    { name: "Signaux & Systèmes",   exam: "", td: "", ep: 60, tp: 40, coef: 2 },
  ],
  S5: [
    { name: "Module Spécialité 1",  exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "Module Spécialité 2",  exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "Module Spécialité 3",  exam: "", td: "", ep: 60, tp: 40, coef: 2 },
    { name: "TP Spécialité",        exam: "", td: "", ep:  0, tp:100, coef: 2 },
    { name: "Option 1",             exam: "", td: "", ep: 60, tp: 40, coef: 2 },
  ],
  S6: [
    { name: "Module Master 1",      exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "Module Master 2",      exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "Projet de Fin Cycle",  exam: "", td: "", ep:100, tp:  0, coef: 6 },
    { name: "Stage / Mémoire",      exam: "", td: "", ep:100, tp:  0, coef: 4 },
  ],
};

// ── DOM refs ───────────────────────────────────────────────────
const rowsList   = document.getElementById("rowsList");
const btnAdd     = document.getElementById("btnAdd");
const btnReset   = document.getElementById("btnReset");
const btnCalc    = document.getElementById("btnCalc");
const errorBar   = document.getElementById("errorBar");
const errorMsg   = document.getElementById("errorMsg");
const resultDash = document.getElementById("resultDash");

// ── Utilities ──────────────────────────────────────────────────
const esc = s =>
  String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

function showError(msg) {
  errorMsg.textContent = msg;
  errorBar.hidden      = false;
  resultDash.hidden    = true;
  errorBar.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function clearError() { errorBar.hidden = true; }

// ── Enable/disable grade inputs based on their weight ──────────
function updateInputStates(row) {
  const inpExam = row.querySelector(".inp-exam");
  const inpTd   = row.querySelector(".inp-td");
  const ep      = parseFloat(row.querySelector(".inp-ep").value) || 0;
  const tp      = parseFloat(row.querySelector(".inp-tp").value) || 0;

  // If exam weight is 0% → disable exam input and force it to 0
  if (ep === 0) {
    inpExam.value    = "0";
    inpExam.disabled = true;
    inpExam.classList.add("inp-disabled");
    inpExam.title = "Non requis (pondération 0%)";
  } else {
    // Only re-enable if it was previously auto-disabled (value "0" and disabled)
    if (inpExam.disabled) {
      inpExam.value    = "";
      inpExam.disabled = false;
      inpExam.classList.remove("inp-disabled");
      inpExam.title = "";
    }
  }

  // If TD weight is 0% → disable TD input and force it to 0
  if (tp === 0) {
    inpTd.value    = "0";
    inpTd.disabled = true;
    inpTd.classList.add("inp-disabled");
    inpTd.title = "Non requis (pondération 0%)";
  } else {
    if (inpTd.disabled) {
      inpTd.value    = "";
      inpTd.disabled = false;
      inpTd.classList.remove("inp-disabled");
      inpTd.title = "";
    }
  }
}

// ── Real-time average per row ──────────────────────────────────
function recalcRow(row) {
  updateInputStates(row);

  const inpExam = row.querySelector(".inp-exam");
  const inpTd   = row.querySelector(".inp-td");
  const ep      = parseFloat(row.querySelector(".inp-ep").value) / 100;
  const tp      = parseFloat(row.querySelector(".inp-tp").value) / 100;
  const cell    = row.querySelector(".avg-cell");

  // Use 0 for disabled (zero-weight) fields
  const examVal = inpExam.disabled ? 0 : parseFloat(inpExam.value);
  const tdVal   = inpTd.disabled   ? 0 : parseFloat(inpTd.value);

  // Need a valid grade only for non-zero-weight fields
  const examOk = ep === 0 || (!isNaN(examVal) && examVal >= 0 && examVal <= 20);
  const tdOk   = tp === 0 || (!isNaN(tdVal)   && tdVal   >= 0 && tdVal   <= 20);

  if (examOk && tdOk && !isNaN(ep) && !isNaN(tp)
      && Math.abs(ep + tp - 1) < 0.02) {
    const avg = ((ep === 0 ? 0 : examVal) * ep) + ((tp === 0 ? 0 : tdVal) * tp);
    cell.textContent = avg.toFixed(2);
    cell.classList.add("has-val");
    if (avg >= 10) {
      cell.classList.add("avg-pass");
      cell.classList.remove("avg-fail");
      row.classList.add("row-pass");
      row.classList.remove("row-fail");
    } else {
      cell.classList.add("avg-fail");
      cell.classList.remove("avg-pass");
      row.classList.add("row-fail");
      row.classList.remove("row-pass");
    }
  } else {
    cell.textContent = "—";
    cell.classList.remove("has-val","avg-pass","avg-fail");
    row.classList.remove("row-pass","row-fail");
  }
}

// ── Create a module row ────────────────────────────────────────
function createRow({ name="", exam="", td="", ep=60, tp=40, coef=2 } = {}) {
  rowCounter++;
  const idx = rowCounter;
  const row = document.createElement("div");
  row.className  = "mod-row";
  row.dataset.rid = idx;

  row.innerHTML = `
    <div class="row-idx">${idx}</div>

    <input class="inp-name"
           type="text" placeholder="Nom du module"
           value="${esc(name)}" autocomplete="off" />

    <input class="inp-exam inp-center"
           type="number" placeholder="0–20" min="0" max="20" step="0.25"
           value="${exam}" />

    <input class="inp-td inp-center"
           type="number" placeholder="0–20" min="0" max="20" step="0.25"
           value="${td}" />

    <div class="weight-cell">
      <input class="inp-ep inp-center"
             type="number" placeholder="%" min="0" max="100" step="1"
             value="${ep}" title="Pondération Examen %" />
      <span class="weight-sep">/</span>
      <input class="inp-tp inp-center"
             type="number" placeholder="%" min="0" max="100" step="1"
             value="${tp}" title="Pondération TD/TP %" />
      <button class="weight-preset" title="Appliquer preset global">↺</button>
    </div>

    <input class="inp-coef inp-coef-wrap inp-center"
           type="number" placeholder="1–6" min="0.5" max="10" step="0.5"
           value="${coef}" />

    <div class="avg-cell">—</div>

    <button class="btn-del" title="Supprimer ce module">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6"  y1="6" x2="18" y2="18"/>
      </svg>
    </button>`;

  // ── Sync exam/td weights ─────────────────────────────────────
  const inpEp = row.querySelector(".inp-ep");
  const inpTp = row.querySelector(".inp-tp");

  inpEp.addEventListener("input", () => {
    const v = Math.max(0, Math.min(100, parseFloat(inpEp.value) || 0));
    inpEp.value = v;
    inpTp.value = 100 - v;
    updateInputStates(row);
    recalcRow(row);
  });
  inpTp.addEventListener("input", () => {
    const v = Math.max(0, Math.min(100, parseFloat(inpTp.value) || 0));
    inpTp.value = v;
    inpEp.value = 100 - v;
    updateInputStates(row);
    recalcRow(row);
  });

  // ── Preset button (apply global preset to this row) ──────────
  row.querySelector(".weight-preset").addEventListener("click", () => {
    inpEp.value = globalPreset.exam;
    inpTp.value = globalPreset.td;
    updateInputStates(row);
    recalcRow(row);
  });

  // ── Live recalc on all inputs ────────────────────────────────
  row.querySelectorAll(".inp-exam,.inp-td,.inp-coef").forEach(inp => {
    inp.addEventListener("input", () => recalcRow(row));
  });

  // ── Keyboard nav: Enter → next / new row ────────────────────
  const inputs = [...row.querySelectorAll("input")];
  inputs.forEach((inp, i) => {
    inp.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (i < inputs.length - 1) inputs[i + 1].focus();
        else addRow();
      }
    });
  });

  // ── Delete ───────────────────────────────────────────────────
  row.querySelector(".btn-del").addEventListener("click", () => {
    row.style.transition = "opacity 0.18s, transform 0.18s";
    row.style.opacity    = "0";
    row.style.transform  = "translateX(10px)";
    setTimeout(() => { row.remove(); clearError(); }, 180);
  });

  recalcRow(row);
  return row;
}

function addRow(opts = {}) {
  const row = createRow(opts);
  rowsList.appendChild(row);
  row.querySelector(".inp-name").focus();
  clearError();
}

// ── Load semester template ─────────────────────────────────────
function loadTemplate(sem) {
  rowsList.innerHTML = "";
  rowCounter         = 0;
  const tpl = SEM_TEMPLATES[sem] || [
    { name: "", exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "", exam: "", td: "", ep: 60, tp: 40, coef: 3 },
    { name: "", exam: "", td: "", ep: 60, tp: 40, coef: 2 },
  ];
  tpl.forEach(m => rowsList.appendChild(createRow(m)));
}

// ── Semester pills ─────────────────────────────────────────────
document.querySelectorAll(".s-pill").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".s-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    currentSem = pill.dataset.sem;
    loadTemplate(currentSem);
    resultDash.hidden = true;
    clearError();
  });
});

// ── Global preset pills ────────────────────────────────────────
document.querySelectorAll(".p-pill").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".p-pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    globalPreset = { exam: parseInt(pill.dataset.exam), td: parseInt(pill.dataset.td) };

    // Apply to all existing rows
    rowsList.querySelectorAll(".mod-row").forEach(row => {
      row.querySelector(".inp-ep").value = globalPreset.exam;
      row.querySelector(".inp-tp").value = globalPreset.td;
      updateInputStates(row);
      recalcRow(row);
    });
  });
});

// ── Buttons ────────────────────────────────────────────────────
btnAdd.addEventListener("click", () => addRow({ ep: globalPreset.exam, tp: globalPreset.td }));

btnReset.addEventListener("click", () => {
  loadTemplate(currentSem);
  resultDash.hidden = true;
  clearError();
  btnReset.style.transform = "rotate(-360deg)";
  btnReset.style.transition = "transform 0.4s";
  setTimeout(() => { btnReset.style.transform = ""; btnReset.style.transition = ""; }, 400);
});

// ── Calculate ──────────────────────────────────────────────────
btnCalc.addEventListener("click", calculate);
document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") calculate();
});

async function calculate() {
  clearError();

  const rows   = [...rowsList.querySelectorAll(".mod-row")];
  if (!rows.length) { showError("Ajoutez au moins un module."); return; }

  const modules = rows.map(row => ({
    name:     row.querySelector(".inp-name").value.trim(),
    exam:     row.querySelector(".inp-exam").value,
    td:       row.querySelector(".inp-td").value,
    exam_pct: row.querySelector(".inp-ep").value,
    td_pct:   row.querySelector(".inp-tp").value,
    coef:     row.querySelector(".inp-coef").value,
  }));

  // Quick client-side check — skip fields with 0% weight
  for (const m of modules) {
    const examNeeded = parseFloat(m.exam_pct) > 0;
    const tdNeeded   = parseFloat(m.td_pct)   > 0;
    if (examNeeded && m.exam === "") {
      showError("Veuillez remplir toutes les notes d'examen.");
      return;
    }
    if (tdNeeded && m.td === "") {
      showError("Veuillez remplir toutes les notes TD/TP.");
      return;
    }
  }

  // Loading state
  btnCalc.disabled    = true;
  btnCalc.textContent = "Calcul en cours…";

  try {
    const res  = await fetch("/calculate", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ modules }),
    });
    const data = await res.json();

    if (!res.ok) { showError(data.error || "Erreur serveur."); return; }
    renderResult(data);
  } catch {
    showError("Impossible de contacter le serveur.");
  } finally {
    btnCalc.disabled    = false;
    btnCalc.innerHTML   = `Calculer la Moyenne <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`;
  }
}

// ── Render result ──────────────────────────────────────────────
function renderResult(data) {
  const {
    semester_average: avg, passed, mention,
    total_coef, earned_coef, credit_rate, module_count, modules
  } = data;

  // ── Score ──────────────────────────────────────────────────
  const dsNum = document.getElementById("dsNumber");
  dsNum.textContent = avg.toFixed(2);
  // color by result
  dsNum.style.color = passed
    ? (avg >= 14 ? "#38bdf8" : avg >= 12 ? "#10b981" : "#d4a853")
    : "#ef4444";

  // Mention badge
  const mentionEl  = document.getElementById("dsMention");
  const codeMap    = { tb:"mt", b:"mb", ab:"ma", p:"mp", f:"mf" };
  mentionEl.textContent = mention.label;
  mentionEl.className   = `ds-mention ${codeMap[mention.code] || "mf"}`;

  // ── Gauge ──────────────────────────────────────────────────
  const arc       = document.getElementById("gaugeArc");
  const maxLen    = 157; // half-circle perimeter ≈ π×50
  const progress  = Math.min(avg / 20, 1) * maxLen;
  arc.setAttribute("stroke-dasharray", `${progress.toFixed(1)} ${maxLen}`);
  arc.setAttribute("stroke", passed
    ? (avg >= 14 ? "#38bdf8" : "#10b981")
    : (avg >= 8  ? "#d4a853" : "#ef4444"));

  // ── Stats ──────────────────────────────────────────────────
  document.getElementById("scCoef").textContent   = total_coef;
  document.getElementById("scEarned").textContent = `${earned_coef}/${total_coef}`;
  document.getElementById("scRate").textContent   = `${credit_rate}%`;
  document.getElementById("scCount").textContent  = module_count;

  // ── Breakdown ──────────────────────────────────────────────
  const bkRows = document.getElementById("bkRows");
  bkRows.innerHTML = modules.map((m, i) => `
    <div class="bk-row ${m.passed ? "bk-pass" : "bk-fail"}"
         style="animation-delay:${i * 0.035}s">
      <span class="bk-name" title="${esc(m.name)}">${esc(m.name)}</span>
      <span class="bk-num">${m.exam}/20</span>
      <span class="bk-num">${m.td}/20</span>
      <span class="bk-num">${m.exam_pct}/${m.td_pct}</span>
      <span class="bk-num">${m.coef}</span>
      <span class="bk-avg-cell ${m.passed ? "pass" : "fail"}">${m.average.toFixed(2)}</span>
      <span class="bk-num">${m.weighted.toFixed(2)}</span>
      <span class="bk-status ${m.passed ? "pass" : "fail"}">
        ${m.passed ? "Validé ✓" : "Ajourné ✗"}
      </span>
    </div>`).join("");

  // ── Show ───────────────────────────────────────────────────
  resultDash.hidden = false;
  resultDash.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Init ───────────────────────────────────────────────────────
loadTemplate("S1");
