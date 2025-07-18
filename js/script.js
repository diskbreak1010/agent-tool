// ------------------------
// 🔹 Top Navigation Tabs
// ------------------------
const navLinks = document.querySelectorAll(".nav-link");
const mainSections = document.querySelectorAll(".main-section");

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    const targetId = link.getAttribute("data-section");
    mainSections.forEach(section => section.classList.remove("visible"));
    document.getElementById(targetId).classList.add("visible");

    if (targetId === "schedules") loadSchedules();
    if (targetId === "knowledge") loadKBIndex();
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
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/diskbreak1010/agent-tool/main/";

async function fetchJSON(path) {
  try {
    const response = await fetch(GITHUB_RAW_URL + encodeURI(path));
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
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
// 🆕 🔹 Knowledge Base (KB)
// ------------------------
let kbArticles = [];

async function loadKBIndex() {
  const data = await fetchJSON("kb/index.json");
  if (!data || !Array.isArray(data)) return;
  kbArticles = data;
  displayKBList(data);
}

function displayKBList(articles) {
  const kbList = document.getElementById("kbList");
  kbList.innerHTML = "";
  document.getElementById("kbArticleContainer").classList.add("hidden");

  articles.forEach(article => {
    const div = document.createElement("div");
    div.className = "kb-article-title";
    div.textContent = article.title;
    div.onclick = () => loadKBArticle(article.filename); // ✅ Use filename instead of slug
    kbList.appendChild(div);
  });
}

async function loadKBArticle(filename) {
  const article = await fetchJSON(`kb/${filename}`); // ✅ Directly use filename
  const container = document.getElementById("kbArticleContainer");
  if (!article) {
    container.innerHTML = "<p>❌ Article not found.</p>";
    container.classList.remove("hidden");
    return;
  }

  container.innerHTML = `
    <h2>${article.title}</h2>
    <p><strong>Tags:</strong> ${article.tags.join(", ")}</p>
    <div>${article.content.replace(/\n/g, "<br>")}</div>
  `;
  container.classList.remove("hidden");
}

function filterKBArticles(query) {
  const q = query.toLowerCase();
  const filtered = kbArticles.filter(a =>
    a.title.toLowerCase().includes(q) || a.tags.join(" ").toLowerCase().includes(q)
  );
  displayKBList(filtered);
}


// ------------------------
// 🔹 Schedule Data
// ------------------------
const scheduleSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQaivnleZd95nd3H6pvOpgjds7VcnX2X8R4ygpw-C2iS5kwbmbUyu8FqLcAqywNEqK_P46vB6n1eAdu/pub?gid=0&single=true&output=csv";

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
// 🔹 Dev Mode Login & Features
// ------------------------
const devLoginForm = document.getElementById("devLoginForm");
const devDashboard = document.getElementById("devDashboard");
const loginError = document.getElementById("loginError");

const validUsername = "admin";
const validPassword = "bpts2025!";

let logoutTimer = null;

function resetLogoutTimer() {
  clearTimeout(logoutTimer);
  logoutTimer = setTimeout(() => {
    alert("Session expired. Logging out.");
    logoutDev();
  }, 15 * 60 * 1000);
}

function logoutDev() {
  const form = devLoginForm.querySelector("form");
  if (form) form.reset();
  devLoginForm.classList.remove("hidden");
  devDashboard.classList.add("hidden");
  loginError.classList.add("hidden");
  clearTimeout(logoutTimer);
}

function handleDevLogin(e) {
  e.preventDefault();
  const user = document.getElementById("devUsername").value;
  const pass = document.getElementById("devPassword").value;

  if (user === validUsername && pass === validPassword) {
    devLoginForm.classList.add("hidden");
    devDashboard.classList.remove("hidden");
    loginError.classList.add("hidden");
    resetLogoutTimer();
  } else {
    loginError.classList.remove("hidden");
  }
  return false;
}

["click", "mousemove", "keydown", "scroll"].forEach(evt =>
  document.addEventListener(evt, () => {
    if (!devDashboard.classList.contains("hidden")) {
      resetLogoutTimer();
    }
  })
);

const devTabs = document.querySelectorAll(".dev-tab");
const devTabContents = document.querySelectorAll(".dev-tab-content");

const defaultContentTemplates = {
  qa: `
    <h3>QA Criteria Submission</h3>
    <label for="qa-metric">Metric Name</label>
    <input type="text" id="qa-metric" placeholder="e.g. Call Handling" />

    <label for="qa-description">Description</label>
    <textarea id="qa-description" rows="4" placeholder="Describe the QA metric..."></textarea>

    <button onclick="alert('QA Submitted!')">Submit</button>
  `,
  coaching: `
    <h3>Coaching Tips Form</h3>
    <label for="coach-title">Tip Title</label>
    <input type="text" id="coach-title" placeholder="e.g. Empathy Tips" />

    <label for="coach-text">Tip Content</label>
    <textarea id="coach-text" rows="4" placeholder="Enter coaching content..."></textarea>

    <button onclick="alert('Coaching Tip Saved!')">Save</button>
  `,
  analytics: `
    <h3>Analytics Overview</h3>
    <p>This section can show charts or stats from your dataset.</p>
    <ul>
      <li>📊 Weekly QA Pass Rate</li>
      <li>📈 Coaching Effectiveness</li>
      <li>⏱️ Avg Handling Time</li>
    </ul>
  `,
  issues: `
    <h3>Common Issues</h3>
    <ul>
      <li>📌 System Timeout</li>
      <li>📌 Login Failure</li>
      <li>📌 Report Not Loading</li>
    </ul>
  `,
  troubleshooting: `
    <h3>Troubleshooting Guide</h3>
    <p>✅ Restart system</p>
    <p>✅ Check connection</p>
    <p>✅ Log errors if repeated</p>
  `
};

devTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    devTabs.forEach(t => t.classList.remove("active"));
    devTabContents.forEach(c => c.classList.add("hidden"));

    tab.classList.add("active");
    const target = tab.getAttribute("data-devtab");
    const content = document.getElementById(target);

    if (content) {
      content.classList.remove("hidden");
      if (!content.innerHTML.trim() && defaultContentTemplates[target]) {
        content.innerHTML = defaultContentTemplates[target];
      }
    }
  });
});
