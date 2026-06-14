const defaultContractors = [
  { id: "ctr-1001", company: "Delta Flow Services", contact: "Ada Nwosu", scope: "Maintenance", status: "Compliant", expiry: "2026-09-18", documents: ["insurance.pdf", "hse-certificate.pdf", "tax-clearance.pdf"] },
  { id: "ctr-1002", company: "Northline Drilling", contact: "Musa Bello", scope: "Drilling", status: "Pending", expiry: "2026-07-02", documents: ["insurance.pdf"] },
  { id: "ctr-1003", company: "HarborLift Logistics", contact: "Tari Ebi", scope: "Transport", status: "Expired", expiry: "2026-05-24", documents: [] }
];

const defaultAssets = [
  { id: "ast-2001", name: "Wellhead WH-17", type: "Wellhead", location: "Flow Station A", inspector: "Kemi Lawal", condition: "Ready", lastInspection: "2026-06-02", nextInspection: "2026-07-02", files: ["wh-17-checklist.pdf"], notes: "Pressure test complete." },
  { id: "ast-2002", name: "Transfer Pump P-04", type: "Pump", location: "Terminal 2", inspector: "John Peters", condition: "Due", lastInspection: "2026-05-01", nextInspection: "2026-06-18", files: ["pump-photo.jpg"], notes: "Schedule vibration check." },
  { id: "ast-2003", name: "Storage Tank ST-12", type: "Storage Tank", location: "Tank Farm East", inspector: "Bola Hassan", condition: "Critical", lastInspection: "2026-05-18", nextInspection: "2026-06-15", files: ["corrosion-report.pdf", "inspection-photo.jpg"], notes: "Corrosion observed around lower ring." }
];

function getCollection(key, seed) {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function badgeClass(status) {
  if (status === "Compliant" || status === "Ready") return "good";
  if (status === "Pending" || status === "Due") return "warn";
  return "danger";
}

function daysBetween(date) {
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date() - new Date(date)) / oneDay);
}

function renderRows(container, rows, type) {
  container.innerHTML = rows.map((row) => {
    const title = type === "contractor" ? row.company : row.name;
    const subtitle = type === "contractor"
      ? `${row.scope} - ${row.documents.length} document${row.documents.length === 1 ? "" : "s"}`
      : `${row.location} - next ${row.nextInspection}`;
    const status = type === "contractor" ? row.status : row.condition;
    return `
      <div class="status-row">
        <div>
          <strong>${title}</strong>
          <span>${subtitle}</span>
        </div>
        <span class="badge ${badgeClass(status)}">${status}</span>
      </div>
    `;
  }).join("");
}

function exportSummary(contractors, assets) {
  const rows = [
    ["Metric", "Value"],
    ["Total contractors", contractors.length],
    ["Compliant contractors", contractors.filter((item) => item.status === "Compliant").length],
    ["Pending documents", contractors.reduce((total, item) => total + Math.max(0, 3 - item.documents.length), 0)],
    ["Total assets", assets.length],
    ["Critical assets", assets.filter((item) => item.condition === "Critical").length],
    ["Recent inspections", assets.filter((item) => daysBetween(item.lastInspection) <= 30).length]
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = "oilops360-summary.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

const contractors = getCollection("oilops360Contractors", defaultContractors);
const assets = getCollection("oilops360Assets", defaultAssets);
const user = JSON.parse(localStorage.getItem("oilops360User") || '{"name":"admin","role":"Compliance Manager"}');

const compliant = contractors.filter((item) => item.status === "Compliant").length;
const critical = assets.filter((item) => item.condition === "Critical").length;
const pendingDocs = contractors.reduce((total, item) => total + Math.max(0, 3 - item.documents.length), 0);
const recentInspections = assets.filter((item) => daysBetween(item.lastInspection) <= 30).length;
const readyAssets = assets.filter((item) => item.condition === "Ready").length;

document.getElementById("userPill").textContent = user.role;
document.getElementById("totalContractors").textContent = contractors.length;
document.getElementById("compliantContractors").textContent = `${compliant} compliant`;
document.getElementById("totalAssets").textContent = assets.length;
document.getElementById("criticalAssets").textContent = `${critical} critical`;
document.getElementById("pendingDocs").textContent = pendingDocs;
document.getElementById("recentInspections").textContent = recentInspections;

document.getElementById("contractorMeter").value = contractors.length ? Math.round((compliant / contractors.length) * 100) : 0;
document.getElementById("assetMeter").value = assets.length ? Math.round((readyAssets / assets.length) * 100) : 0;

renderRows(document.getElementById("contractorStatusList"), contractors.slice(0, 5), "contractor");
renderRows(document.getElementById("assetStatusList"), assets.slice(0, 5), "asset");

document.getElementById("exportSummary").addEventListener("click", () => exportSummary(contractors, assets));
document.querySelector("[data-logout]").addEventListener("click", () => {
  localStorage.removeItem("oilops360User");
  window.location.href = "index.html";
});
