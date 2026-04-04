# Implementation Plan: Submitting CSV files for Mass Generation

To enable users to upload a CSV with multiple clients and receive multiple generated letters in return, we need to adapt both the frontend interface and the n8n logic. 

Here is a step-by-step implementation plan.

## 1. Frontend Updates (`index.html`)

Currently, the frontend uses a single form and posts one JSON object to the API. We need to implement a batch processing UI alongside it.

### A. UI Additions
*   **Mode Switcher**: Add a toggle or tab system at the top of the form area (e.g., "Single Entry" vs. "Batch Upload").
*   **File Input**: When in "Batch Upload" mode, display an `<input type="file" accept=".csv" />` drag-and-drop zone.
*   **Output Display**: The output panel needs to be changed from a single `<div class="draft-box">` to a list or grid of expandable cards, each showing one letter. 
*   **Bulk Actions**: Provide buttons to "Print All" and "Download All as TXT/PDF".

### B. JavaScript Processing
*   **CSV Parsing**: Introduce a lightweight script to parse the uploaded CSV. The CSV is expected to have generic headers like `debtor_name`, `creditor_name`, `amount`, `invoice_date`, `due_date`, `deadline_date`, etc.
*   **Payload Structuring**: Convert the parsed CSV rows into an array of parameter objects.
*   **API Request**: Depending on how we configure n8n (see below), we either:
    1.  Post the entire array in **one single payload** to the webhook (recommended).
    2.  Send individual requests in a loop using `Promise.all()` (less efficient but requires zero n8n structural changes).

## 2. Backend Updates (`n8n Workflow`)

We will adjust the n8n workflow to handle an array of inputs rather than a singular object. I reviewed your current `Mahnschreiben_Generator.json` to map out exactly what needs to change.

### A. Webhook Node
*   The webhook currently accepts a generic JSON payload. We will adjust it to expect a root array (if sending the whole batch in one call), like `{"batch": [{ "debtor_name": "A", ... }, { "debtor_name": "B", ... }]}`.

### B. Normalize Node (n8n-nodes-base.set)
*   Right now, "Normalize" extracts hardcoded values using `={{ $json.body.debtor_name }}`. 
*   If we pass an array inside `body.batch`, we will insert an **Item Lists node** before Normalize to split the array of records into individual n8n items. The Set node will then act upon each item in the batch automatically.

### C. Code Node (`Assemble Letter`)
*   The code currently fetches only the first normalized item:
    `const d = $('Normalize').first().json;`
*   **Refactor**: Change the script to iterate over all items that enter the node. Instead of just grabbing `.first()`, we will use `$input.all()`:
    ```javascript
    const items = $input.all();
    const results = [];

    for (const item of items) {
      const d = item.json;
      // ... run the existing assembly logic ...
      results.push({
        json: { 
          debtor_name: d.debtor_name, 
          draft: draft, 
          blocks_included: selected.length 
        }
      });
    }

    return results;
    ```

### D. Re-bundling and Webhook Response
*   Since the webhook must return a single HTTP response (an array of generated drafts), we will add another **Item Lists node (Aggregate)** after the Code node. This gathers all the individually generated letter strings back into one array list.
*   The **Respond to Webhook node** will receive this final grouped list and return it back to the frontend.

---

### Summary of execution flow
1. User uploads `clients.csv`.
2. Frontend JS parses CSV `->` builds JSON Array `->` POSTs to webhook.
3. n8n splits the Array into Items `->` generates a letter for each item in the loop `->` groups the results `->` responds with JSON Array of drafted letters.
4. Frontend maps the JSON Array into individual result cards on the screen.

Whenever you want to proceed, I can write the specific code modifications to your `index.html` and generate an updated `Mahnschreiben_Generator_v2.json` for you to import into n8n. Let me know if you approve this approach or have any custom mapping requirements for the CSV!
