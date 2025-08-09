// ------------------------
// 🔹 Global Cache
// ------------------------
const cache = {};
const version = "?v=" + Date.now(); // cache-busting


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
// ------------------------
// 🔹 Top Navigation Tabs
// ------------------------
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    const targetId = link.getAttribute("data-section");
    mainSections.forEach(section => section.classList.remove("visible"));
    const section = document.getElementById(targetId);
    if (section) section.classList.add("visible");

    // 🔁 Lazy load with cache-busting
    const version = "?v=" + Date.now();  // Forces new load

    if (targetId === "schedules") {
      loadSchedules(version);
    }
    if (targetId === "templates") {
      loadEmailTemplates(version);
    }
    if (targetId === "contacts") {
      loadContacts(version);
    }
    if (targetId === "edgecases") {
      loadEdgeCases(version);
    }
    if (targetId === "escalations") {
      loadEscalations(version);
    }
  });
});

// ====================================================
// 🔹 ESCALATIONS LOADER + MODAL HANDLER
// ====================================================
async function loadEscalations() {
  const container = document.getElementById("escalationList");
  container.innerHTML = "<p>Loading escalation guides...</p>";

  const data = await fetchJSON("escalations/index.json");
  if (!data || !Array.isArray(data)) {
    container.innerHTML = "<p>❌ Failed to load escalation list.</p>";
    return;
  }

  container.innerHTML = "";
  data.forEach(item => {
    const div = document.createElement("div");
div.className = "escalation-card card-flex";
div.dataset.category = item.category || "escalation"; // Add category data attribute
div.innerHTML = `
  <div class="card-text">
    <h4>${item.title}</h4>
    <p>${item.summary}</p>
  </div>
  <div class="card-actions">
    <button onclick="showEscalationModal('${item.filename}')" class="card-button">View</button>
  </div>
`;

    container.appendChild(div);
  });
}

async function showEscalationModal(filename, category = "escalation") {
  const modal = document.getElementById("escalationModal");
  const title = document.getElementById("escalationModalTitle");
  const summary = document.getElementById("escalationModalSummary");
  const stepsList = document.getElementById("escalationStepsList");
  const reStepsList = document.getElementById("reEscalationStepsList");
  const fullText = document.getElementById("escalationFullText");
  const processHeader = document.getElementById("processHeader");
  const reEscalationHeader = document.getElementById("reEscalationHeader");

  title.textContent = "Loading...";
  summary.textContent = "";
  stepsList.innerHTML = "";
  reStepsList.innerHTML = "";
  fullText.innerHTML = "";
  modal.classList.remove("hidden");

  const data = await fetchJSON(`escalations/${filename}`);
  if (!data) {
    title.textContent = "❌ Failed to load escalation data";
    return;
  }

  title.textContent = data.title || "Escalation Guide";
  summary.textContent = data.summary || "";

  // Hide all headers by default
  processHeader.style.display = "none";
  stepsList.style.display = "none";
  reEscalationHeader.style.display = "none";
  reStepsList.style.display = "none";

  if (category === "process") {
    // Show process steps if present
    if (data.process && data.process.length > 0) {
      processHeader.style.display = "block";
      processHeader.textContent = "📌 Process Steps:";
      stepsList.style.display = "block";
      data.process.forEach(step => {
        const li = document.createElement("li");
        li.textContent = step;
        stepsList.appendChild(li);
      });
    }
  } else if (category === "escalation") {
    // Show escalation steps if present
    if (data.process && data.process.length > 0) {
      processHeader.style.display = "block";
      processHeader.textContent = "📌 Process Steps:";
      stepsList.style.display = "block";
      data.process.forEach(step => {
        const li = document.createElement("li");
        li.textContent = step;
        stepsList.appendChild(li);
      });
    }

    // Show re-escalation steps if present
    if (data.reEscalation && data.reEscalation.length > 0) {
      reEscalationHeader.style.display = "block";
      reEscalationHeader.textContent = "🔁 Re-Escalation Steps:";
      reStepsList.style.display = "block";
      data.reEscalation.forEach(step => {
        const li = document.createElement("li");
        li.textContent = step;
        reStepsList.appendChild(li);
      });
    }
  }

  // Show note only if present
  if (data.note && data.note.trim() !== "") {
    fullText.textContent = data.note;
  } else {
    fullText.textContent = "";
  }
}


// ========================
// 🔹 Escalation Modal Close
// ========================
document.getElementById("closeEscalationModal").addEventListener("click", () => {
  document.getElementById("escalationModal").classList.add("hidden");
});

document.addEventListener("click", function (e) {
  const modal = document.getElementById("escalationModal");
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

function filterEscalations(searchTerm) {
  const allTemplates = document.querySelectorAll('#escalationList .escalation-card');
  allTemplates.forEach(template => {
    const title = template.querySelector('h4')?.textContent.toLowerCase() || '';
    const summary = template.querySelector('p')?.textContent.toLowerCase() || '';
    const matches = title.includes(searchTerm.toLowerCase()) || summary.includes(searchTerm.toLowerCase());
    template.style.display = matches ? 'flex' : 'none';
  });
}

// ====================================================
// 🔹 EDGE CASES LOADER (From templates.json)
// ====================================================
async function loadEdgeCases() {
  const container = document.getElementById("edgeCaseList");
  container.innerHTML = "<p>Loading edge cases...</p>";

  const data = await fetchJSON("edgecases/templates.json"); // ✅ Now loads from templates.json
  console.log("Fetched Edge Cases:", data);
  if (!data || !Array.isArray(data)) {
    container.innerHTML = "<p>❌ Failed to load edge case list.</p>";
    return;
  }

  container.innerHTML = "";
  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "edgecase-card card-flex";
    div.innerHTML = `
      <div class="card-text">
        <h4>${item.title}</h4>
        <p><strong>Category:</strong> ${item.category}</p>
        <p>${item.summary}</p>
      </div>
      <div class="card-actions">
        <button onclick="showEdgeCaseModal('${item.filename}')" class="card-button">View</button>
      </div>
    `;
    container.appendChild(div);
  });
}

// ====================================================
// 🔹 EDGE CASE MODAL HANDLER
// ====================================================
async function showEdgeCaseModal(filename) {
  const modal = document.getElementById("edgecaseModal");
  const title = document.getElementById("edgecaseModalTitle");
  const summary = document.getElementById("edgecaseModalSummary");
  const details = document.getElementById("edgecaseDetails");

  title.textContent = "Loading...";
  summary.textContent = "";
  details.innerHTML = "";
  modal.classList.remove("hidden");

  const data = await fetchJSON(`edgecases/${filename}`);
  if (!data) {
    title.textContent = "❌ Failed to load edge case data";
    return;
  }

  title.textContent = data.title || "Edge Case";
  summary.textContent = data.summary || "";
  details.innerHTML = data.body || "";
}

// ========================
// 🔹 Edge Case Modal Close
// ========================
document.getElementById("closeEdgeCaseModal").addEventListener("click", () => {
  document.getElementById("edgecaseModal").classList.add("hidden");
});

document.addEventListener("click", function (e) {
  const modal = document.getElementById("edgecaseModal");
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});


// ------------------------
// 🔹 Sidebar Dropdowns
// ------------------------
function toggleDropdown(id, button) {
  const dropdown = document.getElementById(id);
  const isOpen = dropdown.style.display === "flex";

  // Close all dropdowns and remove active state from buttons
  document.querySelectorAll(".dropdown").forEach(d => (d.style.display = "none"));
  document.querySelectorAll(".toggle-button").forEach(btn => btn.classList.remove("active-dropdown"));

  if (!isOpen) {
    dropdown.style.display = "flex";
    button.classList.add("active-dropdown");
  }
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
const GITHUB_RAW_URL = "/";

async function fetchJSON(path) {
  if (cache[path]) return cache[path];
  try {
    // Fetch from your own site (works on Netlify and locally)
    const response = await fetch(encodeURI(path) + `?v=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status} – ${response.statusText}`);
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
const scheduleSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vStORPEOoTDKyZmhozoHdLi04RHk53TeuZU2o6_dl2mv9Fxy8hG5RGCesBmdEpN6e12eUZFPHbqDCps/pub?gid=435840210&single=true&output=csv";

async function loadSchedules() {
  const container = document.getElementById("schedules");
  try {
    const res = await fetch(scheduleSheetURL + version); // 💡 add version here
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
  <div class="email-template-text">
    <h4>${tpl.title}</h4>
    <p>${tpl.preview}</p>
  </div>
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
  const otaContainer = document.getElementById("otaGroup");
  const otherContainer = document.getElementById("otherGroup");

  otaContainer.innerHTML = "<p>Loading OTA contacts...</p>";
  otherContainer.innerHTML = "<p>Loading other contacts...</p>";

  const contacts = await fetchJSON("contacts/directory.json");

  if (!contacts || !Array.isArray(contacts)) {
    otaContainer.innerHTML = "<p>❌ Failed to load contacts.</p>";
    otherContainer.innerHTML = "";
    return;
  }

  // Group contacts by category
  const grouped = {};
  contacts.forEach(contact => {
    const cat = contact.category || "Others";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(contact);
  });

  // OTA Section
  otaContainer.innerHTML = "";
  if (grouped.OTA) {
    grouped.OTA.forEach(c => {
      const card = document.createElement("div");
      card.className = "contact-card";
      card.innerHTML = `
        <h4>${c.name}</h4>
        ${c.email ? `<p><strong>Email:</strong> <a href="mailto:${c.email}">${c.email}</a></p>` : ""}
        ${c.phone ? `<p><strong>Phone:</strong> <a href="tel:${c.phone}">${c.phone}</a></p>` : ""}
        ${c.turnaround ? `<p><strong>Turnaround:</strong> ${c.turnaround}</p>` : ""}
        ${c["follow-up"] ? `<p><strong>Follow-up:</strong> ${c["follow-up"]}</p>` : ""}
      `;
      otaContainer.appendChild(card);
    });
    delete grouped.OTA;
  } else {
    otaContainer.innerHTML = "<p>No OTA contacts found.</p>";
  }

  // Other Contacts Section
  otherContainer.innerHTML = "";
  Object.entries(grouped).forEach(([category, contacts]) => {
    contacts.forEach(c => {
      const card = document.createElement("div");
      card.className = "contact-card";
      card.innerHTML = `
        <h4>${c.name}</h4>
        ${c.email ? `<p><strong>Email:</strong> <a href="mailto:${c.email}">${c.email}</a></p>` : ""}
        ${c.phone ? `<p><strong>Phone:</strong> <a href="tel:${c.phone}">${c.phone}</a></p>` : ""}
        ${c.turnaround ? `<p><strong>Turnaround:</strong> ${c.turnaround}</p>` : ""}
        ${c["follow-up"] ? `<p><strong>Follow-up:</strong> ${c["follow-up"]}</p>` : ""}
        ${c["description"] ? `<p><strong>Description:</strong> ${c["description"]}</p>` : ""}
      `;
      otherContainer.appendChild(card);
    });
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
    template.style.display = matches ? 'flex' : 'none';
  });

  // Hide category sections if all children are hidden
  allCategories.forEach(category => {
    const visibleTemplates = category.querySelectorAll('.email-template:not([style*="display: none"])');
    category.style.display = visibleTemplates.length > 0 ? 'block' : 'none';
  });
}

// ------------------------
// 🔹 Theme Toggle
// ------------------------

function initThemeToggle() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// ⛳ START: Dynamic Sidebar Renderer
// Load and render sidebar based on nested JSON structure
async function loadSidebar() {
  const data = await fetchJSON("sidebarData.json");
  if (!data) return;

  const sidebar = document.querySelector(".sidebar");
  const sidebarContent = document.getElementById("sidebarContent");

  // Remove any previously loaded sections
  sidebar.querySelectorAll(".sidebar-section").forEach(s => s.remove());

  Object.entries(data).forEach(([sectionTitle, sectionItems], index) => {
    const section = document.createElement("div");
    section.className = "sidebar-section";

    const dropdownId = `dropdown-${index}`;
    const toggle = document.createElement("button");
    toggle.className = "toggle-button";
    toggle.innerHTML = `${sectionTitle} <span>▼</span>`;
    toggle.onclick = () => toggleDropdown(dropdownId, toggle);
    section.appendChild(toggle);

    const ul = document.createElement("ul");
    ul.className = "dropdown";
    ul.id = dropdownId;

    Object.entries(sectionItems).forEach(([key, value]) => {
      ul.appendChild(createSidebarItem(key, value));
    });

    section.appendChild(ul);
    sidebar.insertBefore(section, sidebarContent);
  });
}

// Recursively create sidebar items for nested objects
function createSidebarItem(key, value) {
  const li = document.createElement("li");
  const hasChildren = typeof value === "object" && value !== null;

  const label = document.createElement("span");
  label.textContent = key;
  li.appendChild(label);

  if (!hasChildren) {
    // If it's a content item (string), clicking shows content
    li.onclick = (e) => {
      e.stopPropagation();
      document.querySelectorAll(".dropdown li").forEach(i => i.classList.remove("active"));
      li.classList.add("active");
      document.getElementById("sidebarContent").innerHTML = `
        <div><h4>${key}</h4><p>${value}</p></div>`;
    };
  } else {
    // If it has children, make the entire li toggleable
    const arrow = document.createElement("span");
    arrow.textContent = "▶";
    arrow.style.float = "right";
    arrow.style.pointerEvents = "none"; // So only <li> click counts
    li.appendChild(arrow);

    const nestedList = document.createElement("ul");
    nestedList.className = "dropdown";
    nestedList.style.display = "none";

    Object.entries(value).forEach(([childKey, childValue]) => {
      nestedList.appendChild(createSidebarItem(childKey, childValue));
    });

    li.appendChild(nestedList);

    li.onclick = (e) => {
      e.stopPropagation();
      const isVisible = nestedList.style.display === "block";
      nestedList.style.display = isVisible ? "none" : "block";
      arrow.textContent = isVisible ? "▶" : "▼";
    };
  }

  return li;
}

// ✅ END: Dynamic Sidebar Renderer

window.addEventListener("load", function () {
  const toggleBtn = document.getElementById("notepadToggleBtn");
  const panel = document.getElementById("notepadPanel");
  const clearBtn = document.getElementById("clearNotepadBtn");
  const collapseBtn = document.getElementById("collapseNotepadBtn");

  toggleBtn?.addEventListener("click", () => {
    panel.classList.remove("hidden");
    toggleBtn.style.display = "none";
  });

  collapseBtn?.addEventListener("click", () => {
    panel.classList.add("hidden");
    toggleBtn.style.display = "inline-block";
  });

  clearBtn?.addEventListener("click", () => {
    document.getElementById("notepadArea").innerHTML = ""; // ✅ FIXED HERE
  });
});

document.addEventListener("DOMContentLoaded", function () {
    const notepad = document.getElementById("notepadArea");

    let escalationsLoaded = false;
    let edgeCasesLoaded = false;

    // Preload escalation data
    loadEscalations();
    escalationsLoaded = true;

    document.getElementById("escalation-tab").addEventListener("click", function () {
        if (!escalationsLoaded) {
            loadEscalations();
            escalationsLoaded = true;
        }
    });

    document.getElementById("edgecase-tab").addEventListener("click", function () {
        if (!edgeCasesLoaded) {
            loadEdgeCases();
            edgeCasesLoaded = true;
        }
    });

    notepad.addEventListener("keydown", function (e) {
        if (e.key === "Tab") {
            e.preventDefault();
            document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }
    });
});

function formatText(command) {
  document.execCommand(command, false, null);
}
