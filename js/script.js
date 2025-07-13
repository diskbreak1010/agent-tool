const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/diskbreak1010/agent-tool/main/';

async function fetchJSON('categories/owner.json') {
  const fullUrl = 'https://raw.githubusercontent.com/diskbreak1010/agent-tool/main/' + 'categories/owner.json';
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
  const fullPath = `resolutions/${pathParts.join('/')}.json`;
  return await fetchJSON(fullPath);
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
  const requestor = document.getElementById('requestor').value;
  clearDynamicFields();

  if (!requestor) return;

  const categories = await loadCategories(requestor);
  if (categories && Object.keys(categories).length > 0) {
    const dropdown = createDropdown('Category', categories, [requestor]);
    document.getElementById('dynamicFields').appendChild(dropdown);
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
    option.textContent = key;
    select.appendChild(option);
  });

  select.addEventListener('change', async () => {
    while (wrapper.nextSibling) {
      document.getElementById('dynamicFields').removeChild(wrapper.nextSibling);
    }

    const selected = select.value;
    if (!selected) return;

    const newPath = [...pathSoFar, selected];
    const nextOptions = options[selected];

    if (nextOptions && Object.keys(nextOptions).length > 0) {
      const nextDropdown = createDropdown('Next', nextOptions, newPath);
      document.getElementById('dynamicFields').appendChild(nextDropdown);
    } else {
      const resolutionData = await loadResolution(newPath);
      if (resolutionData) {
        showResolution(resolutionData);
      }
    }
  });

  wrapper.appendChild(select);
  return wrapper;
}

document.getElementById('requestor').addEventListener('change', handleRequestorChange);

function copyText(id) {
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text).then(() => alert('Copied!'));
}
