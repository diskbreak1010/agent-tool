const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/diskbreak1010/agent-tool/main/';

async function fetchJSON(path) {
  const fullUrl = GITHUB_RAW_URL + encodeURI(path);
  console.log("📡 Fetching:", fullUrl);
  const response = await fetch(fullUrl);
  if (!response.ok) {
    console.error('❌ Failed to fetch:', fullUrl);
    return null;
  }
  return response.json();
}

async function loadCategories(requestor) {
  return await fetchJSON(`categories/${requestor}.json`);
}

async function loadResolution(pathParts) {
  // skip the first part (e.g., 'owner') for folder path
  const folderPath = pathParts.slice(1, -1).join('/');
  const fileName = pathParts[pathParts.length - 1] + '.json';
  const fullPath = `resolutions/${folderPath}/${fileName}`;
  return await fetchJSON(fullPath);
}

function capitalize(text) {
  return text
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function clearDynamicFields() {
  document.getElementById('dynamicFields').innerHTML = '';
  document.getElementById('resolutionContainer').classList.add('hidden');
  document.getElementById('instructionText').textContent = '';
  document.getElementById('emailTemplate').textContent = '';
  document.getElementById('kbLink').textContent = '';
  document.getElementById('relatedCasesList').innerHTML = '';
}

function showResolution(resolution) {
  document.getElementById('resolutionContainer').classList.remove('hidden');
  document.getElementById('instructionText').textContent = resolution.instruction || '—';
  document.getElementById('emailTemplate').textContent = resolution.emailTemplate || '—';
  document.getElementById('kbLink').textContent = resolution.kb || '—';

  const list = document.getElementById('relatedCasesList');
  list.innerHTML = '';
  (resolution.relatedCases || []).forEach(id => {
    const li = document.createElement('li');
    li.textContent = id;
    list.appendChild(li);
  });
}

async function handleRequestorChange() {
  const select = document.getElementById('requestor');
  const requestor = select.value;
  clearDynamicFields();

  if (!requestor) return;

  const categories = await loadCategories(requestor);
  if (categories) {
    const dropdown = createDropdown('Category', categories, [requestor]);
    document.getElementById('dynamicFields').appendChild(dropdown);
  } else {
    console.warn(`⚠️ No categories found for requestor: ${requestor}`);
  }
}

async function handleCategoryChange(pathParts) {
  const resolution = await loadResolution(pathParts);
  if (resolution) {
    showResolution(resolution);
  } else {
    console.warn("⚠️ No resolution found for path:", pathParts.join(' > '));
  }
}

function createDropdown(labelText, options, pathSoFar) {
  const wrapper = document.createElement('div');
  const label = document.createElement('label');
  label.textContent = labelText;
  wrapper.appendChild(label);

  const select = document.createElement('select');
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = `Select ${labelText}`;
  select.appendChild(defaultOption);

  Object.keys(options).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = capitalize(key);
    select.appendChild(option);
  });

  select.addEventListener('change', async () => {
    while (wrapper.nextSibling) {
      document.getElementById('dynamicFields').removeChild(wrapper.nextSibling);
    }

    const selectedValue = select.value;
    if (!selectedValue) return;

    const newPath = [...pathSoFar, selectedValue];
    const subOptions = options[selectedValue];

    if (subOptions && Object.keys(subOptions).length > 0) {
      const nextDropdown = createDropdown('Next', subOptions, newPath);
      document.getElementById('dynamicFields').appendChild(nextDropdown);
    } else {
      await handleCategoryChange(newPath);
    }
  });

  wrapper.appendChild(select);
  return wrapper;
}

document.getElementById('requestor').addEventListener('change', handleRequestorChange);

function copyText(id) {
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard!');
  });
}
