# Implementation Plan: Modifying Textbausteine (Text Snippets)

## Objective
To provide users with the ability to customize, edit, and manage the standard text blocks (Textbausteine) used to construct the dunning letters, moving away from rigid, hardcoded templates.

## Functionality Options & Concepts

### Option 1: Inline Output Editing (Post-Generation)
Currently, the letters are assembled and displayed as read-only text. We could make the generated output cards directly editable on the screen.
*   **How it works**: The user generates the batch. The results appear. Before clicking "Drucken" (Print) or "Alle Kopieren" (Copy All), the user can click directly into the text of any letter and tweak specific words just for that single output.
*   **Pros**: Very easy to implement. Great for edge cases where one specific client needs a slightly different tone or a custom explanation.
*   **Cons**: Doesn't solve the problem of wanting to permanently change the default phrasing of a specific block for *all* future letters.

### Option 2: Frontend Template Settings (Pre-Generation)
We introduce a "Vorlagen" (Templates) tab. Here, users can define their own base texts using variables.
*   **How it works**: 
    The interface provides `textarea` inputs for each conditional building block. For example:
    *   *Einleitung (Intro)*: e.g., `Sehr geehrte Damen und Herren,`
    *   *Hauptteil (Main Body)*: e.g., `Unsere Rechnung vom {{invoice_date}} über den Betrag von {{amount}} ist noch offen.`
    *   *Frist (Deadline)*: e.g., `Wir setzen Ihnen eine letzte Frist bis zum {{deadline_date}}.`
    *   *Klageandrohung (Legal)*: e.g., `Sollten Sie nicht zahlen, leiten wir rechtliche Schritte ein.`
*   The user's custom templates are automatically saved in the browser's memory (`localStorage`) so they only have to configure this once.
*   When "Generate" is clicked, these template fragments are passed along in the webhook payload, and the n8n backend uses the *user's customized templates* to stitch the letter together instead of its own hardcoded variants.
*   **Pros**: Full control over the wording. Changes are persistent. Supports flexible client demands.
*   **Cons**: Requires users to understand a simple variable syntax (like putting `{{amount}}` where the money should go).

### Option 3: Full Local Generation (Bypass Backend)
*   **How it works**: If we define all the text blocks dynamically in the frontend Settings, the frontend has everything it needs to generate the final letter. We could bypass n8n entirely and generate the text instantly in Javascript.
*   **Pros**: Instantaneous generation with zero loading time. Reduces backend server load.
*   **Cons**: Moves business logic entirely out of n8n. If you plan to extend n8n later (e.g., to automatically send emails via integrations, generate PDFs securely, or log debts into an Airtable/Database), keeping the generation process inside n8n is much better.

---

## Recommended Approach: Hybrid (Option 1 + Option 2 via n8n)

I recommend we implement both **Option 1** and **Option 2**, while keeping the core generation inside your n8n workflow.

### Phase A: The Templates UI (Settings)
1. Add a **"Textbausteine" Tab** next to "Einzelner Eintrag" and "CSV Batch Upload".
2. Create visually distinct `textarea` fields for the core text blocks (Einleitung, Hauptteil, Letzte Frist, Verzugszinsen, Rechtliche Schritte, Grußformel).
3. Display a small legend of available variables: `{{creditor}}`, `{{debtor}}`, `{{amount}}`, `{{invoice_date}}`, `{{due_date}}`, etc.
4. Add Javascript logic to save/load these inputs to/from `localStorage`.

### Phase B: Backend Payload Adjustments
1. Modify the `generateLetter()` API call in `index.html` to inject a `templates` object into the payload being sent to n8n.
2. In the n8n "Assemble Letter" code node, we will update the script. If a `templates` object is provided, it uses those. Otherwise, it falls back to the current defaults.

### Phase C: Inline Editing (Quick Win)
1. Change the `<div class="draft-card-body">` element to have the HTML attribute `contenteditable="true"`.
2. This immediately allows the user to click into any generated text and fix typos or add custom lines before exporting.

---

Let me know which direction you want to take! 
If you like the recommended approach, I can immediately begin writing the frontend elements for Phase A and C.
