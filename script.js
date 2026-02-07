// -------------------------
// QuickBid - Estimate App
// -------------------------

const hoursEl = document.getElementById("hours");
const rateEl = document.getElementById("rate");
const materialsEl = document.getElementById("materials");
const markupEl = document.getElementById("markup");
const taxEl = document.getElementById("tax");

const laborOut = document.getElementById("laborOut");
const materialsOut = document.getElementById("materialsOut");
const markupOut = document.getElementById("markupOut");
const taxOut = document.getElementById("taxOut");
const totalOut = document.getElementById("totalOut");

const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const clearSavedBtn = document.getElementById("clearSavedBtn");
const savedList = document.getElementById("savedList");

const STORAGE_KEY = "quickbid_saved_estimates";

// Convert input string to number safely
function num(value) {
  const n = parseFloat(value);
  return isNaN(n) ? 0 : n;
}

function money(value) {
  return `$${value.toFixed(2)}`;
}

function getInputs() {
  return {
    hours: num(hoursEl.value),
    rate: num(rateEl.value),
    materials: num(materialsEl.value),
    markupPercent: num(markupEl.value),
    taxPercent: num(taxEl.value),
  };
}
function calculate(inputs) {
  const labor = inputs.hours * inputs.rate;
  const base = labor + inputs.materials;

  const markupAmount = base * (inputs.markupPercent / 100);
  const afterMarkup = base + markupAmount;

  const taxAmount = afterMarkup * (inputs.taxPercent / 100);
  const total = afterMarkup + taxAmount;

  return {
    labor,
    materials: inputs.materials,
    markupAmount,
    taxAmount,
    total,
  };
}

function updateLiveTotal() {
  const inputs = getInputs();
  const result = calculate(inputs);

  laborOut.textContent = money(result.labor);
  materialsOut.textContent = money(result.materials);
  markupOut.textContent = money(result.markupAmount);
  taxOut.textContent = money(result.taxAmount);
  totalOut.textContent = money(result.total);
}

function clearInputs() {
  hoursEl.value = "";
  rateEl.value = "";
  materialsEl.value = "";
  markupEl.value = "";
  taxEl.value = "";
  updateLiveTotal();
}

function loadSaved() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveSaved(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderSaved() {
  const saved = loadSaved();
  savedList.innerHTML = "";

  if (saved.length === 0) {
    savedList.innerHTML = `<li style="color:#9fb0e8;">No saved estimates yet.</li>`;
    return;
  }

  saved.forEach((item) => {
    const li = document.createElement("li");
    li.className = "saved-item";

    li.innerHTML = `
      <div>
        <strong>${money(item.total)}</strong>
        <small>${item.date}</small>
      </div>
      <button data-id="${item.id}">❌</button>
    `;
    savedList.appendChild(li);
  });
}

function saveEstimate() {
  const inputs = getInputs();
  const result = calculate(inputs);

  // Prevent saving empty estimates
  const hasAnything =
    inputs.hours > 0 || inputs.rate > 0 ||
 inputs.materials > 0;

  if (!hasAnything) {
    alert("Enter at least hours, rate, or materials before saving.");
    return;
  }

  const saved = loadSaved();

  const estimate = {
    id: crypto.randomUUID(),
    date: new Date().toLocaleString(),
    ...inputs,
    ...result,
  };

  saved.unshift(estimate); // newest first
  saveSaved(saved);
  renderSaved();
}

function deleteEstimate(id) {
  const saved = loadSaved();
  const filtered = saved.filter((e) => e.id !== id);
  saveSaved(filtered);
  renderSaved();
}

function clearSaved() {
  const ok = confirm("Clear ALL saved estimates?");
  if (!ok) return;

  localStorage.removeItem(STORAGE_KEY);
  renderSaved();
}

// Live updates
hoursEl.addEventListener("input", updateLiveTotal);
rateEl.addEventListener("input", updateLiveTotal);
materialsEl.addEventListener("input", updateLiveTotal);
markupEl.addEventListener("input", updateLiveTotal);
taxEl.addEventListener("input", updateLiveTotal);

// Buttons
saveBtn.addEventListener("click", saveEstimate);
clearBtn.addEventListener("click", clearInputs);
clearSavedBtn.addEventListener("click", clearSaved);

// Delete buttons (event delegation)
savedList.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const id = e.target.dataset.id;
    deleteEstimate(id);
  }
});

// Start
updateLiveTotal();
renderSaved();