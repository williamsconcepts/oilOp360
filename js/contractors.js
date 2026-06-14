const contractorSeed = [
  {
    id: "ctr-1001",
    company: "Delta Flow Services",
    contact: "Ada Nwosu",
    scope: "Maintenance",
    status: "Compliant",
    expiry: "2026-09-18",
    documents: ["insurance.pdf", "hse-certificate.pdf", "tax-clearance.pdf"]
  },
  {
    id: "ctr-1002",
    company: "Northline Drilling",
    contact: "Musa Bello",
    scope: "Drilling",
    status: "Pending",
    expiry: "2026-07-02",
    documents: ["insurance.pdf"]
  },
  {
    id: "ctr-1003",
    company: "HarborLift Logistics",
    contact: "Tari Ebi",
    scope: "Transport",
    status: "Expired",
    expiry: "2026-05-24",
    documents: []
  }
];

let contractors = loadContractors();

const form = document.getElementById("contractorForm");
const table = document.getElementById("contractorTable");
const search = document.getElementById("contractorSearch");
const statusFilter = document.getElementById("contractorStatusFilter");
const documentInput = document.getElementById("documents");
const documentChips = document.getElementById("documentChips");
let stagedDocuments = [];

function loadContractors() {
  const stored = localStorage.getItem("oilops360Contractors");
  if (stored) return JSON.parse(stored);
  localStorage.setItem("oilops360Contractors", JSON.stringify(contractorSeed));
  return contractorSeed;
}

function saveContractors() {
  localStorage.setItem("oilops360Contractors", JSON.stringify(contractors));
}

function getUserRole() {
  const fallback = { role: "Compliance Manager" };
  return JSON.parse(localStorage.getItem("oilops360User") || JSON.stringify(fallback)).role;
}

function canEdit() {
  return getUserRole() !== "Viewer";
}

function badgeClass(status) {
  if (status === "Compliant") return "good";
  if (status === "Pending") return "warn";
  return "danger";
}

function renderDocumentChips(files) {
  documentChips.innerHTML = files.length
    ? files.map((file) => `<span>${file}</span>`).join("")
    : "<span>No documents attached</span>";
}

function resetForm() {
  form.reset();
  document.getElementById("contractorId").value = "";
  document.getElementById("contractorFormTitle").textContent = "Add Contractor";
  stagedDocuments = [];
  renderDocumentChips(stagedDocuments);
}

function renderTable() {
  const query = search.value.trim().toLowerCase();
  const status = statusFilter.value;
  const filtered = contractors.filter((contractor) => {
    const matchesQuery = [contractor.company, contractor.contact, contractor.scope]
      .join(" ")
      .toLowerCase()
      .includes(query);
    const matchesStatus = status === "All" || contractor.status === status;
    return matchesQuery && matchesStatus;
  });

  table.innerHTML = filtered.map((contractor) => `
    <tr>
      <td><strong>${contractor.company}</strong><br><span>${contractor.contact}</span></td>
      <td>${contractor.scope}</td>
      <td><span class="badge ${badgeClass(contractor.status)}">${contractor.status}</span></td>
      <td><span class="file-count">${contractor.documents.length} file${contractor.documents.length === 1 ? "" : "s"}</span></td>
      <td>${contractor.expiry}</td>
      <td>
        <div class="row-actions">
          <button class="icon-button" type="button" data-edit="${contractor.id}" ${canEdit() ? "" : "disabled"}>Edit</button>
          <button class="icon-button danger" type="button" data-delete="${contractor.id}" ${canEdit() ? "" : "disabled"}>Delete</button>
        </div>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="6">No contractors match the current filters.</td></tr>`;
}

function editContractor(id) {
  const contractor = contractors.find((item) => item.id === id);
  if (!contractor) return;
  document.getElementById("contractorId").value = contractor.id;
  document.getElementById("company").value = contractor.company;
  document.getElementById("contact").value = contractor.contact;
  document.getElementById("scope").value = contractor.scope;
  document.getElementById("contractorStatus").value = contractor.status;
  document.getElementById("expiry").value = contractor.expiry;
  document.getElementById("contractorFormTitle").textContent = "Edit Contractor";
  stagedDocuments = [...contractor.documents];
  renderDocumentChips(stagedDocuments);
}

function deleteContractor(id) {
  contractors = contractors.filter((contractor) => contractor.id !== id);
  saveContractors();
  renderTable();
  resetForm();
}

function exportCsv() {
  const rows = [
    ["Company", "Contact", "Scope", "Status", "Expiry", "Documents"],
    ...contractors.map((item) => [
      item.company,
      item.contact,
      item.scope,
      item.status,
      item.expiry,
      item.documents.join("; ")
    ])
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = "oilops360-contractors.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

documentInput.addEventListener("change", () => {
  stagedDocuments = [...stagedDocuments, ...Array.from(documentInput.files).map((file) => file.name)];
  renderDocumentChips(stagedDocuments);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!canEdit()) return;

  const id = document.getElementById("contractorId").value || `ctr-${Date.now()}`;
  const record = {
    id,
    company: document.getElementById("company").value,
    contact: document.getElementById("contact").value,
    scope: document.getElementById("scope").value,
    status: document.getElementById("contractorStatus").value,
    expiry: document.getElementById("expiry").value,
    documents: stagedDocuments
  };

  const existingIndex = contractors.findIndex((contractor) => contractor.id === id);
  if (existingIndex >= 0) contractors[existingIndex] = record;
  else contractors.unshift(record);

  saveContractors();
  renderTable();
  resetForm();
});

table.addEventListener("click", (event) => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;
  if (editId) editContractor(editId);
  if (deleteId) deleteContractor(deleteId);
});

document.querySelector("[data-logout]").addEventListener("click", () => {
  localStorage.removeItem("oilops360User");
  window.location.href = "index.html";
});

document.getElementById("newContractorBtn").addEventListener("click", resetForm);
document.getElementById("resetContractorForm").addEventListener("click", resetForm);
document.getElementById("exportContractors").addEventListener("click", exportCsv);
search.addEventListener("input", renderTable);
statusFilter.addEventListener("change", renderTable);

if (!canEdit()) {
  form.querySelectorAll("input, select, button").forEach((element) => {
    if (element.id !== "resetContractorForm") element.disabled = true;
  });
}

renderDocumentChips(stagedDocuments);
renderTable();
