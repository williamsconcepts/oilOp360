const assetSeed = [
  {
    id: "ast-2001",
    name: "Wellhead WH-17",
    type: "Wellhead",
    location: "Flow Station A",
    inspector: "Kemi Lawal",
    condition: "Ready",
    lastInspection: "2026-06-02",
    nextInspection: "2026-07-02",
    files: ["wh-17-checklist.pdf"],
    notes: "Pressure test complete."
  },
  {
    id: "ast-2002",
    name: "Transfer Pump P-04",
    type: "Pump",
    location: "Terminal 2",
    inspector: "John Peters",
    condition: "Due",
    lastInspection: "2026-05-01",
    nextInspection: "2026-06-18",
    files: ["pump-photo.jpg"],
    notes: "Schedule vibration check."
  },
  {
    id: "ast-2003",
    name: "Storage Tank ST-12",
    type: "Storage Tank",
    location: "Tank Farm East",
    inspector: "Bola Hassan",
    condition: "Critical",
    lastInspection: "2026-05-18",
    nextInspection: "2026-06-15",
    files: ["corrosion-report.pdf", "inspection-photo.jpg"],
    notes: "Corrosion observed around lower ring."
  }
];

let assets = loadAssets();

const form = document.getElementById("assetForm");
const table = document.getElementById("assetTable");
const search = document.getElementById("assetSearch");
const conditionFilter = document.getElementById("assetConditionFilter");
const fileInput = document.getElementById("inspectionFiles");
const fileChips = document.getElementById("inspectionFileChips");
let stagedFiles = [];

function loadAssets() {
  const stored = localStorage.getItem("oilops360Assets");
  if (stored) return JSON.parse(stored);
  localStorage.setItem("oilops360Assets", JSON.stringify(assetSeed));
  return assetSeed;
}

function saveAssets() {
  localStorage.setItem("oilops360Assets", JSON.stringify(assets));
}

function getUserRole() {
  const fallback = { role: "Compliance Manager" };
  return JSON.parse(localStorage.getItem("oilops360User") || JSON.stringify(fallback)).role;
}

function canEdit() {
  return getUserRole() !== "Viewer";
}

function badgeClass(condition) {
  if (condition === "Ready") return "good";
  if (condition === "Due") return "warn";
  return "danger";
}

function renderFileChips(files) {
  fileChips.innerHTML = files.length
    ? files.map((file) => `<span>${file}</span>`).join("")
    : "<span>No inspection files attached</span>";
}

function resetForm() {
  form.reset();
  document.getElementById("assetId").value = "";
  document.getElementById("assetFormTitle").textContent = "Add Asset";
  stagedFiles = [];
  renderFileChips(stagedFiles);
}

function renderTable() {
  const query = search.value.trim().toLowerCase();
  const condition = conditionFilter.value;
  const filtered = assets.filter((asset) => {
    const matchesQuery = [asset.name, asset.location, asset.inspector, asset.type]
      .join(" ")
      .toLowerCase()
      .includes(query);
    const matchesCondition = condition === "All" || asset.condition === condition;
    return matchesQuery && matchesCondition;
  });

  table.innerHTML = filtered.map((asset) => `
    <tr>
      <td><strong>${asset.name}</strong><br><span>${asset.type}</span></td>
      <td>${asset.location}</td>
      <td><span class="badge ${badgeClass(asset.condition)}">${asset.condition}</span></td>
      <td>${asset.nextInspection}</td>
      <td><span class="file-count">${asset.files.length} file${asset.files.length === 1 ? "" : "s"}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-button" type="button" data-edit="${asset.id}" ${canEdit() ? "" : "disabled"}>Edit</button>
          <button class="icon-button danger" type="button" data-delete="${asset.id}" ${canEdit() ? "" : "disabled"}>Delete</button>
        </div>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="6">No assets match the current filters.</td></tr>`;
}

function editAsset(id) {
  const asset = assets.find((item) => item.id === id);
  if (!asset) return;
  document.getElementById("assetId").value = asset.id;
  document.getElementById("assetName").value = asset.name;
  document.getElementById("assetType").value = asset.type;
  document.getElementById("location").value = asset.location;
  document.getElementById("inspector").value = asset.inspector;
  document.getElementById("condition").value = asset.condition;
  document.getElementById("lastInspection").value = asset.lastInspection;
  document.getElementById("nextInspection").value = asset.nextInspection;
  document.getElementById("notes").value = asset.notes;
  document.getElementById("assetFormTitle").textContent = "Edit Asset";
  stagedFiles = [...asset.files];
  renderFileChips(stagedFiles);
}

function deleteAsset(id) {
  assets = assets.filter((asset) => asset.id !== id);
  saveAssets();
  renderTable();
  resetForm();
}

function exportCsv() {
  const rows = [
    ["Asset", "Type", "Location", "Inspector", "Condition", "Last inspection", "Next inspection", "Files", "Notes"],
    ...assets.map((item) => [
      item.name,
      item.type,
      item.location,
      item.inspector,
      item.condition,
      item.lastInspection,
      item.nextInspection,
      item.files.join("; "),
      item.notes
    ])
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = "oilops360-assets.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

fileInput.addEventListener("change", () => {
  stagedFiles = [...stagedFiles, ...Array.from(fileInput.files).map((file) => file.name)];
  renderFileChips(stagedFiles);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!canEdit()) return;

  const id = document.getElementById("assetId").value || `ast-${Date.now()}`;
  const record = {
    id,
    name: document.getElementById("assetName").value,
    type: document.getElementById("assetType").value,
    location: document.getElementById("location").value,
    inspector: document.getElementById("inspector").value,
    condition: document.getElementById("condition").value,
    lastInspection: document.getElementById("lastInspection").value,
    nextInspection: document.getElementById("nextInspection").value,
    files: stagedFiles,
    notes: document.getElementById("notes").value
  };

  const existingIndex = assets.findIndex((asset) => asset.id === id);
  if (existingIndex >= 0) assets[existingIndex] = record;
  else assets.unshift(record);

  saveAssets();
  renderTable();
  resetForm();
});

table.addEventListener("click", (event) => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;
  if (editId) editAsset(editId);
  if (deleteId) deleteAsset(deleteId);
});

document.querySelector("[data-logout]").addEventListener("click", () => {
  localStorage.removeItem("oilops360User");
  window.location.href = "index.html";
});

document.getElementById("newAssetBtn").addEventListener("click", resetForm);
document.getElementById("resetAssetForm").addEventListener("click", resetForm);
document.getElementById("exportAssets").addEventListener("click", exportCsv);
search.addEventListener("input", renderTable);
conditionFilter.addEventListener("change", renderTable);

if (!canEdit()) {
  form.querySelectorAll("input, select, textarea, button").forEach((element) => {
    if (element.id !== "resetAssetForm") element.disabled = true;
  });
}

renderFileChips(stagedFiles);
renderTable();
