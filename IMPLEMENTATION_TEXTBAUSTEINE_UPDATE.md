# Implementation Plan: Textbausteine & Legal Precision (CETI)

This plan outlines the steps to align the generated text modules with the professional legal standards of the CETI template (Daniel Grosche) as seen in the provided source documents.

## 1. Data Model & Placeholder Expansion

We need to add more specific fields to the `row` object in the UI and the placeholder resolver to handle the nuances of copyright infringement.

### 1.1 New Placeholders
| Placeholder | Description |
| :--- | :--- |
| `{{GEGNER_WERK_DESC}}` | Description of the work (e.g., "Panorama-Lichtbildwerk"). |
| `{{GEGNER_PLATFORM}}` | Platform where found (e.g., "LinkedIn-Präsenz"). |
| `{{GEGNER_REFERENZ_SCREENSHOT}}` | Reference to evidence (e.g., "nachstehendem Screenshot"). |
| `{{CREDITOR_WEBSITE}}` | Professional website of the photographer. |

---

## 2. Segmented Template Structure

Move away from a single "body" block and transition to a segmented system for the `copyright_gewerblich` template.

### 2.1 Segment Blocks
- **Mandat**: Standard representation intro + statement on professional photography status ("Lebenserwerb").
- **Facts**: Specific description of the work and where it was found.
- **Legal Reasoning**: Detailed citation of §§ 16, 19a, 13 UrhG.
- **Damages (Erhöhungsfaktoren)**: Bullet points explaining why the license fee is justified (effort, social media, missing name, fame).
- **Enclosure (UE)**: High-fidelity wording for the *Unterlassungserklärung* including the payment obligation clause.

---

## 3. UI Enhancements

### 3.1 Case Context Toggles
Add a new section in the "Einzelner Eintrag" (Single Entry) tab:
- **Checkbox**: "Social Media / LinkedIn Nutzung"
- **Checkbox**: "Urheberbenennung fehlt (+100%)"
- **Checkbox**: "Besonderer Aufwand (Panorama/Langzeit)"
- **Checkbox**: "Hoher Bekanntheitsgrad des Urhebers"

*Note: These toggles will conditionally append text blocks to the letter body.*

---

## 4. Implementation Steps

### Phase 1: Update Constants & Placeholders
- [x] Add new fields to the `EXPECTED_FIELDS` array.
- [x] Update `tagMapping` in `replaceTemplateTags()` to handle new placeholders.
- [x] Implement conditional visibility for "Increase Factor" strings.

### Phase 2: High-Fidelity Text Revision
- [x] Rewrite `cetiTemplates.copyright_gewerblich` body/intro/fees based on the Word document screenshots.
- [x] Rewrite `cetiTemplates.copyright_gewerblich.ue` to match the settlement-style wording in image 2.

### Phase 3: UI Controls
- [x] Add the "Faktoren" (Factors) control group to the sidebar/form.
- [x] Ensure these flags are saved/loaded alongside other form data.

---

## 5. Verification
- [x] Generate a sample letter and compare side-by-side with the Word doc.
- [x] Verify that the RVG table in the text matches the calculated values.
- [x] Ensure the UE (Page 2) contains the payment obligation sum correctly.
