// ------------------------
// 🔹 Global Cache
// ------------------------
const cache = {};

// ------------------------
// 🔹 Element Selectors
// ------------------------
const navLinks = document.querySelectorAll(".nav-link");
const mainSections = document.querySelectorAll(".main-section");
const devTabs = document.querySelectorAll(".dev-tab");
const devTabContents = document.querySelectorAll(".dev-tab-content");

// ------------------------
// 🔹 Top Navigation Tabs
// ------------------------
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    const targetId = link.getAttribute("data-section");
    mainSections.forEach(section => section.classList.remove("visible"));
    document.getElementById(targetId).classList.add("visible");

    // Lazy load features
    if (targetId === "schedules") loadSchedules();
    if (targetId === "templates") loadEmailTemplates();
    if (targetId === "contacts") loadContacts();
  });
});

// ------------------------
// 🔹 Sidebar Dropdowns
// ------------------------
function toggleDropdown(id) {
  const dropdown = document.getElementById(id);
  const isOpen = dropdown.style.display === "flex";
  document.querySelectorAll(".dropdown").forEach(d => (d.style.display = "none"));
  dropdown.style.display = isOpen ? "none" : "flex";
}

function showSidebarContent(content) {
  document.getElementById("sidebarContent").innerHTML = `<div>${content} content goes here...</div>`;
}

document.getElementById("clearSidebarBtn").addEventListener("click", () => {
  document.getElementById("sidebarContent").innerHTML = `<div class="default-message">Select a category to view content.</div>`;
  document.querySelectorAll(".dropdown li").forEach(item => item.classList.remove("active"));
});

// ------------------------
// 🔹 Resolution Tool
// ------------------------
const GITHUB_RAW_URL = "https://corsproxy.io/?https://raw.githubusercontent.com/diskbreak1010/agent-tool/main/";

async function fetchJSON(path) {
  if (cache[path]) return cache[path];
  try {
    const response = await fetch(GITHUB_RAW_URL + encodeURI(path));
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    cache[path] = data;
    return data;
  } catch (err) {
    console.error("❌ Fetch error:", path, err);
    return null;
  }
}

async function loadCategories(requestor) {
  return await fetchJSON(`categories/${requestor}.json`);
}

async function loadResolution(pathParts) {
  const folder = pathParts.slice(1, -1).join("/");
  const file = pathParts.at(-1) + ".json";
  return await fetchJSON(`resolutions/${folder}/${file}`);
}

function capitalize(text) {
  return text.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function clearDynamicFields() {
  document.getElementById("dynamicFields").innerHTML = "";
  document.getElementById("resolutionContainer").classList.add("hidden");
  document.getElementById("instructionText").textContent = "";
  document.getElementById("emailTemplate").textContent = "";
  document.getElementById("kbLink").textContent = "";
  document.getElementById("relatedCasesList").innerHTML = "";
}

function showResolution(res) {
  document.getElementById("resolutionContainer").classList.remove("hidden");
  document.getElementById("instructionText").innerHTML = (res.instruction || "—").replace(/\n/g, "<br>");
  document.getElementById("emailTemplate").innerHTML = (res.emailTemplate || "—").replace(/\n/g, "<br>");
  document.getElementById("kbLink").textContent = res.kb || "—";

  const list = document.getElementById("relatedCasesList");
  list.innerHTML = "";
  (res.relatedCases || []).forEach(id => {
    const li = document.createElement("li");
    li.textContent = id;
    list.appendChild(li);
  });
}

document.getElementById("requestor").addEventListener("change", async function () {
  const val = this.value;
  clearDynamicFields();
  const categories = await loadCategories(val);
  if (!categories) return;

  const dropdown = createDropdown("Category", categories, [val]);
  document.getElementById("dynamicFields").appendChild(dropdown);
});

function createDropdown(labelText, options, path) {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = labelText;
  wrapper.appendChild(label);

  const select = document.createElement("select");
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = `Select ${labelText}`;
  select.appendChild(defaultOption);

  Object.keys(options).forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = capitalize(key);
    select.appendChild(option);
  });

  select.addEventListener("change", async () => {
    while (wrapper.nextSibling) wrapper.parentNode.removeChild(wrapper.nextSibling);

    const selectedValue = select.value;
    if (!selectedValue) return;

    const newPath = [...path, selectedValue];
    const subOptions = options[selectedValue];

    if (subOptions && Object.keys(subOptions).length) {
      const nextDropdown = createDropdown("Next", subOptions, newPath);
      document.getElementById("dynamicFields").appendChild(nextDropdown);
    } else {
      const res = await loadResolution(newPath);
      if (res) showResolution(res);
    }
  });

  wrapper.appendChild(select);
  return wrapper;
}

function copyText(id) {
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text).then(() => alert("Copied!"));
}

// ------------------------
// 🔹 Schedule Loader
// ------------------------
const scheduleSheetURL = "https://corsproxy.io/?https://docs.google.com/spreadsheets/d/e/2PACX-1vStORPEOoTDKyZmhozoHdLi04RHk53TeuZU2o6_dl2mv9Fxy8hG5RGCesBmdEpN6e12eUZFPHbqDCps/pub?gid=435840210&single=true&output=csv";

async function loadSchedules() {
  const container = document.getElementById("schedules");
  try {
    const res = await fetch(scheduleSheetURL);
    const csv = await res.text();
    const rows = csv.trim().split("\n").map(row => row.split(","));
    const headers = rows[0];
    const data = rows.slice(1).map(r => {
      const obj = {};
      headers.forEach((key, i) => obj[key.trim()] = r[i]?.trim() || "");
      return obj;
    });

    container.innerHTML = `
      <table class="schedule-table">
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>
          ${data.map(row => `<tr>${headers.map(h => `<td>${row[h] || "—"}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    `;
  } catch (e) {
    console.error("Schedule load failed:", e);
    container.innerHTML = `<p class="schedule-error">❌ Failed to load data</p>`;
  }
}

// ------------------------
// 🔹 Email Templates Loader
// ------------------------
async function loadEmailTemplates() {
  const container = document.getElementById("emailTemplateList");
  container.innerHTML = "<p>Loading templates...</p>";

  const data = await fetchJSON("email/templates.json");
  if (!Array.isArray(data)) {
    container.innerHTML = "<p>❌ Failed to load email templates.</p>";
    return;
  }

  // Group templates by category
  const grouped = {};
  data.forEach(tpl => {
    const cat = tpl.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(tpl);
  });

  const sortedCategories = Object.keys(grouped).sort();
  container.innerHTML = "";

  sortedCategories.forEach(cat => {
    const section = document.createElement("div");
    section.className = "email-category";

    const catName = cat.charAt(0).toUpperCase() + cat.slice(1);
    section.innerHTML = `<h3>📁 ${catName}</h3>`;

    grouped[cat].forEach(tpl => {
      const div = document.createElement("div");
      div.className = "email-template";
      div.innerHTML = `
        <h4>${tpl.title}</h4>
        <p>${tpl.preview}</p>
        <button onclick="showEmailTemplateModal('${tpl.filename}')">View</button>
      `;
      section.appendChild(div);
    });

    container.appendChild(section);
  });
}

// ------------------------
// 🔹 Contacts Directory
// ------------------------
async function loadContacts() {
  const container = document.getElementById("contactList");
  container.innerHTML = "<p>Loading contacts...</p>";
  const contacts = await fetchJSON("contacts/directory.json");
  if (!contacts || !Array.isArray(contacts)) {
    container.innerHTML = "<p>❌ Failed to load contacts.</p>";
    return;
  }

  container.innerHTML = "";
  contacts.forEach(c => {
    const div = document.createElement("div");
    div.className = "contact-card";
    div.innerHTML = `
      <h4>${c.name}</h4>
      <p><strong>Email:</strong> <a href="mailto:${c.email}">${c.email}</a></p>
      <p><strong>Phone:</strong> <a href="tel:${c.phone}">${c.phone}</a></p>
      <p><strong>Department:</strong> ${c.department}</p>
    `;
    container.appendChild(div);
  });
}


// ------------------------
// 🔹 Email Template Modal
// ------------------------

function showEmailTemplateModal(filename) {
  const modal = document.getElementById("emailTemplateModal");
  const modalTitle = document.getElementById("templateTitle");
  const modalCategory = document.getElementById("templateCategory");
  const modalBody = document.getElementById("templateBody");

  modalTitle.textContent = "Loading...";
  modalBody.innerHTML = "<p>Loading template...</p>";
  modal.classList.remove("hidden");

  fetchJSON(`email/${filename}`).then(data => {
    if (!data || !data.body) {
      modalTitle.textContent = "Template Not Found";
      modalBody.innerHTML = "<p>❌ Failed to load template.</p>";
      modalCategory.textContent = "";
      return;
    }

    modalTitle.textContent = data.title || "Email Template";
    modalCategory.textContent = data.category || "—";
    modalBody.innerHTML = `<pre style="white-space: pre-wrap;">${data.body}</pre>`;
  });
}

// ------------------------
// 🔹 Email Template Modal Close
// ------------------------
document.getElementById("closeEmailModal").addEventListener("click", () => {
  document.getElementById("emailTemplateModal").classList.add("hidden");
});

document.addEventListener("click", function (e) {
  const modal = document.getElementById("emailTemplateModal");
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

function filterEmailTemplates(searchTerm) {
  const allTemplates = document.querySelectorAll('.email-template');
  const allCategories = document.querySelectorAll('.email-category');

  allTemplates.forEach(template => {
    const title = template.querySelector('h4')?.textContent.toLowerCase() || '';
    const preview = template.querySelector('p')?.textContent.toLowerCase() || '';
    const matches = title.includes(searchTerm.toLowerCase()) || preview.includes(searchTerm.toLowerCase());
    template.style.display = matches ? 'block' : 'none';
  });

  // Hide category sections if all children are hidden
  allCategories.forEach(category => {
    const visibleTemplates = category.querySelectorAll('.email-template:not([style*="display: none"])');
    category.style.display = visibleTemplates.length > 0 ? 'block' : 'none';
  });
}
