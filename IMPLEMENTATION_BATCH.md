# Implementation Plan: Submitting CSV files for Mass Generation

To enable users to upload a CSV with multiple clients and receive multiple generated letters in return, we need to adapt both the frontend interface and the n8n logic. 

Here is a step-by-step implementation plan.

## 1. Frontend Updates (`index.html`)

Currently, the frontend uses a single form and posts one JSON object to the API. We need to implement a batch processing UI alongside it.

### A. UI Additions
*   [x] **Mode Switcher**: Add a toggle or tab system at the top of the form area (e.g., "Single Entry" vs. "Batch Upload").
*   [x] **File Input**: When in "Batch Upload" mode, display an `<input type="file" accept=".csv" />` drag-and-drop zone.
*   [x] **Output Display**: The output panel needs to be changed from a single `<div class="draft-box">` to a list or grid of expandable cards, each showing one letter. 
*   [x] **Bulk Actions**: Provide buttons to "Print All" and "Download All as TXT/PDF". (Print and Copy All implemented)

### B. JavaScript Processing
*   [x] **CSV Parsing**: Introduce a lightweight script to parse the uploaded CSV. (PapaParse integrated)
*   [x] **Payload Structuring**: Convert the parsed CSV rows into an array of parameter objects.
*   [x] **API Request**: Post the entire array in **one single payload** to the webhook.

## 2. Backend Updates (`n8n Workflow`)

We adjust the n8n workflow to handle an array of inputs rather than a singular object. 

### A. Webhook Node
*   [x] Expect a root array like `{"batch": [{ "debtor_name": "A", ... }, { "debtor_name": "B", ... }]}`.

### B. Normalize Node (n8n-nodes-base.set)
*   [x] Removed! We process the full batch object directly in the Code node.

### C. Code Node (`Assemble Letter`)
*   [x] **Refactor**: Change the script to iterate over all items that enter the node and extract `body.batch` payload to do loop generation internally.

### D. Re-bundling and Webhook Response
*   [x] The **Code Node** returns the complete array of items, and the Response webhook handles returning it to the frontend natively without an aggregate node.

---

### Summary of execution flow
1. User uploads `clients.csv`.
2. Frontend JS parses CSV `->` builds JSON Array `->` POSTs to webhook.
3. n8n splits the Array into Items `->` generates a letter for each item in the loop `->` groups the results `->` responds with JSON Array of drafted letters.
4. Frontend maps the JSON Array into individual result cards on the screen.

Whenever you want to proceed, I can write the specific code modifications to your `index.html` and generate an updated `Mahnschreiben_Generator_v2.json` for you to import into n8n. Let me know if you approve this approach or have any custom mapping requirements for the CSV!
