# Implementation Plan: Premium Output & UX Improvements

## Objective
To elevate the Mahnschreiben-Generator from a simple text-generation tool to a premium SaaS-like application. We will achieve this by implementing a **Briefbogen-Manager (Letterhead Manager)**, an **Echtzeit-PDF-Vorschau (Live Preview)**, and professional **DIN-5008 konforme PDF-Generierung**.

---

## 1. Phase 1: Briefbogen-Manager (Letterhead Settings)
We need to allow users to set their persistent sender information, logo, and footer structure, making the output ready for immediate dispatch.

### UI/UX Updates
- [x] **New Tab**: Create a new tab in the left panel called `Absender & Briefkopf` (Sender & Letterhead).
- [x] **Text Forms**: 
    - [x] *Absenderadresse (Sender Address)*: Name, Street, Zip, City.
    - [x] *Bankverbindung (Bank Details)*: IBAN, BIC, Bank Name.
    - [x] *Unternehmensinfos (Footer Info)*: Geschäftsführer, HRB, USt-IdNr., Website, Email.
- [x] **Media Uploads**:
    - [x] Logo-Upload (drag-and-drop or select).
    - [x] Unterschrift-Upload (Signature-Upload) or an interface to "draw" a signature.

### Technical Implementation
- [x] Create a local store (e.g., `localStorage` for text, `IndexedDB` or Base64 in `localStorage` for images) to persist these settings so the user only configures them once.
- [x] Add functions to read/write these values smoothly without blocking the UI.

---

## 2. Phase 2: Echtzeit-PDF-Vorschau (Live Preview / "Magic" Feature)
Transform the right-hand "Ausgabe" (Output) panel from a simple text box into a beautiful, dynamic DIN A4 canvas that updates as the user types.

### UI/UX Updates
- [x] Replace the raw text `<div class="draft-box">` with an `<article class="a4-preview">`.
- [x] The `.a4-preview` will visually represent a sheet of paper (with realistic drop shadows and scaling to fit the screen size).

### Technical Implementation
- [x] **DIN 5008 Layouting**: Implement a strict CSS grid/flexbox layout simulating the German business letter standard (Form A or B).
    - [x] *Informationsblock / Bezugszeichenzeile* (Top right info block).
    - [x] *Anschriftfeld* (Address window bounds - 85mm x 45mm).
    - [x] *Absenderzeile* (Small sender line above address).
    - [x] *Fußzeile* (Footer containing Bank info, HRB, etc. at the bottom).
    - [x] *Loch- und Faltmarken* (Punch and fold marks on the left margin, for that premium touch).
- [x] **Reactivity**: Attach `input` event listeners to all form fields (Single Mode & Templates Mode). When any input changes, immediately inject the new value or assembled text into the HTML of the `.a4-preview`.

---

## 3. Phase 3: Perfekte PDF-Generierung (High-Quality Export)
Instead of just copying text to the clipboard, the user downloads a professional vector-based PDF.

### Technical Implementation Options
- [ ] **Option A: CSS Paged Media + Browser Print (Recommended for quick start)**
- [x] **Option B: Client-side PDF Library (html2pdf.js / pdfmake)**
    - [x] Integrate a library like `html2pdf.js`.
    - [x] When the user clicks "PDF Herunterladen", the library captures the HTML of the `.a4-preview` and generates a real PDF silently.
- [ ] **Option C: Backend Generation**

**Recommendation**: We start with **Option B** (or **Option A** as a fast fallback) for the most seamless user experience directly inside the browser.

---

## 4. Architectural Impact on n8n (Important Consideration)
- [x] **Current Workflow**: The app sends data to n8n, which assembles the text and sends it back.
- [x] **New Workflow**: If we want *real-time* rendering down to the millisecond on every keystroke, calling the n8n webhook on every typing event will be too slow and expensive.
- [x] **Solution**: We will move the **text assembly logic (stitching variables into templates) entirely into the frontend**. The frontend instantly creates the letter for the Live Preview. 
- [x] *Note*: n8n can still be used for the Batch Processing (generating 100 PDFs at once), but for single letter visualization, doing it in JavaScript is the only way to achieve the "Magic" real-time feel.

---

## Next Steps
1. [x] Review the plan.
2. [x] We will start by building the UI for Phase 1 and 2, migrating the core assembly logic to the frontend to enable real-time previews.
3. [x] Implement Media Uploads for Logo and Signature.
4. [x] Build zip download logic for Batch Mode PDFs.

---

## 5. Phase 4: Aktenzeichen (File Reference) Support
Integrate a first-class "Aktenzeichen" field to improve document tracking and professional organization.

### UI/UX Updates
- [x] **Expected Field**: Add `aktenzeichen` to the list of expected fields for CSV mapping.
- [x] **Templates**: Add a `+ Aktenzeichen` chip in the template editor to insert `{{aktenzeichen}}`.
- [x] **Live Preview**: Display the Aktenzeichen in the "Informationsblock" (top right) of the DIN 5008 letterhead if present.

### Technical Implementation
- [x] **CSV Mapping**: Add aliases for `aktenzeichen` (e.g., "akte", "az", "referenz", "vorgangsnummer").
- [x] **Auto-Generation**: Implement a fallback generator for missing Aktenzeichen in the format `AZ-YYYY-NNNN`.
- [x] **Template Engine**: Update `replaceTemplateTags()` to handle the new placeholder.
- [x] **PDF Naming**: Include the Aktenzeichen in the exported PDF filenames (e.g., `Mahnschreiben_AZ-2026-0001_Max_Mustermann.pdf`).
- [x] **Batch Logic**: Ensure every row in a batch gets an Aktenzeichen (either mapped or generated) before the PDF is created.
