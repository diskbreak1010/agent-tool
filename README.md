# 🛠 Agent Resolution Tool

This is a dynamic resolution assistant built with HTML, CSS, and JavaScript. It uses a JSON-based decision tree to guide support agents to the appropriate resolution, instructions, and templates based on dropdown selections.

---

## 🌐 Live Preview & Script Access

You can view or debug the live script here:

**JavaScript (script.js):**  
📎 https://raw.githubusercontent.com/diskbreak1010/agent-tool/main/js/script.js

You can refresh this link to check for real-time updates right after committing.

---

## 📁 Folder Structure

agent-tool/
├── index.html
├── style.css
├── js/
│ └── script.js
├── categories/
│ └── owner.json
├── resolutions/
│ └── listing/
│ └── verification/
│ └── how to verify/
│ └── owner identity check/
│ └── failed identity check.json


- `categories/` — stores nested dropdown options per requestor.
- `resolutions/` — stores final resolution content files.

---

## ✨ Features

- ✅ Light/Dark mode toggle
- ✅ Dynamic dropdowns (based on JSON files)
- ✅ Resolution section with:
  - Instructions
  - Email templates
  - Knowledge base
  - Related cases
- ✅ Copy buttons for agent efficiency
- ✅ Mobile responsive layout

---

## 🧪 How to Add or Edit Resolutions

### 1. 📂 `categories/owner.json`

Define your dropdown structure using nested keys. Example:

```json
{
  "listing": {
    "verification": {
      "how to verify": {
        "owner identity check": {
          "failed identity check": {}
        }
      }
    }
  }
}

2. Add the Resolution File
Based on the dropdown path, create the JSON file here:

pgsql
Copy
Edit
resolutions/listing/verification/how to verify/owner identity check/failed identity check.json
Sample Resolution File:

json
Copy
Edit
{
  "instruction": "Check Salesforce for an email from Trust & Safety (T&S) with the subject line 'Failed Identity-check'.\n\nIf an email is found:\n\n- Inform the user that they have received a message from the T&S team.\n- Advise them to check their inbox and follow the instructions provided in the email.\n\nIf no email is found:\n\n- Escalate the case to the Trust & Safety (T&S) team for further handling.",
  "emailTemplate": "Subject: Verification Assistance - Failed Identity Check\n\nHi,\n\nThank you for contacting Tripadvisor. We understand you're having difficulty completing the verification process for your listing.\n\nPlease check your inbox for an email with the subject line 'Failed Identity-check'. This message comes from our Trust & Safety team and contains the necessary steps to complete your verification.\n\nKindly follow the instructions outlined in that email.\n\nIf you cannot locate the message or require further assistance, feel free to reply to this message.\n\nThank you for your understanding.\n\nBest regards,\nTripadvisor Support",
  "kb": "Owner Registration & Verification",
  "relatedCases": ["109210", "102837"]
}
🧠 Notes & Tips
Folder and file names are case-sensitive.

Use \n in your JSON content to insert line breaks.

In JavaScript, make sure to replace them with <br>:

js
Copy
Edit
element.innerHTML = value.replace(/\n/g, '<br>');
If the dropdown suddenly stops showing, check:

If the latest commit to owner.json is valid JSON

If all paths and file names are correct

Use https://raw.githubusercontent.com/diskbreak1010/agent-tool/main/...
to access real-time versions of your files.

🧰 Development & Debugging Tools
🌐 Live script:
https://raw.githubusercontent.com/diskbreak1010/agent-tool/main/js/script.js

✅ Validate your JSON files using:
https://jsonlint.com/

✅ Test final URL of resolution paths to check if .json is accessible via browser.

🤝 Developer
Developed and maintained by:
Carlo Louise I. Seminiano
📧 carloseminiano04@gmail.com

📜 License
MIT — Free to use, distribute, and modify.
