# Implementation Plan: CETI Legal Template Integration (DG)

This document outlines the strategic steps to transition the current Mahnschreiben Generator into a professional legal engine tailored for the "CETI" (Daniel Grosche) workflow and aesthetic, specifically focusing on **Copyright Infringement Warning Letters (Abmahnungen)**.

## 1. Overview of the "CETI" Approach
The target template (Abmahnung) is significantly more complex than a standard dunning letter. It requires:
- **Formal Legal Branding**: Precise header/footer layouts with specific attorney information.
- **Variable Legal Case Logic**: Dynamic sections for URLs of infringement, descriptions of works, and legal justifications.
- **RVG Calculations**: Automated calculation of attorney fees based on the `Gegenstandswert` (Amount in Dispute).
- **Multi-Document Generation**: Letter + Enclosure (Strafbewehrte Unterlassungserklärung).

---

## Phase 1: Data Model & Calculation Engine [DONE]
Current placeholders like `{{amount}}` are insufficient. We need a specialized legal data model.

### 1.1 Extended Placeholder Dictionary [DONE]
| Category | Placeholder | Description |
| :--- | :--- | :--- |
| **Case Meta** | `{{AKTE_ZEICHEN}}` | Internal file reference number (e.g., 2024-1234). |
| | `{{AKTE_KURZRUBRUM}}` | Brief case description (e.g., "Grosche vs. Example Corp"). |
| | `{{KURZDATUM}}` | Standard date format (DD.MM.YYYY). |
| **Opponent** | `{{GEGNER_NAME}}` | Full name or Company name of the infringer. |
| | `{{GEGNER_AKTE}}` | External reference number (Opponent's file #). |
| **Evidence** | `{{GEGNER_URL1}}` | URL where the infringement was found. |
| | `{{GEGNER_URL2}}` | Additional link (e.g., social media profile). |
| **Financials** | `{{GEGNER_WERT}}` | Amount in dispute (Gegenstandswert). |
| | `{{GEGNER_SCHADEN}}` | License damages (Umsatz-Lizenzschaden). |

### 1.2 RVG Calculation Logic [DONE]
Implement a utility function to calculate legal fees according to the RVG (Section 13 RVG + No. 2300 VV RVG):
- Input: `Gegenstandswert`.
- Output: `Geschäftsgebühr` (usually 1.3 factor), `Post- und Telekommunikation` (20€ cap), and `Gesamtbetrag`.

---

## Phase 2: UI & Component Revamp [DONE]
The UI must shift from "Invoice Data" to "Case Data".

### 2.1 The "Case Setup" Panel [DONE]
- **Infringement Details**: Inputs for URLs, description of the artistic work (e.g., Panorama photograph), and platform (LinkedIn, Website, etc.).
- **Financial Breakdown**: Toggle for "Schadensersatz" calculation vs fixed amount.
- **Opponent Structure**: Form group for Name, Address, and Titling (Sehr geehrter Herr/Frau...).

### 2.2 Template Selection [DONE]
- Move from block-based assembly to **Template Selection** (e.g., "Gewerblich Infringement", "Private Infringement", "Follow-up Warning").

---

## Phase 3: High-Fidelity PDF Engine (DIN 5008+)
The "Lex" preview needs to be replaced/augmented with the **CETI Corporate Identity**.

### 3.1 Multi-Page Architecture
- **Header/Footer Overlays**: Static legal header (Attorney names, contact) applied to every page.
- **Dynamic Content Flow**: Using a structured DOM approach where the main letter and the *Unterlassungserklärung* are separate pages within the same PDF export.
- **Automatic Page Breaking**: Ensuring legal tables or bullet points are not cut off awkwardly.

### 3.2 Visual Specifics (CETI Style)
- **Typography**: Inter/Roboto for body, Serif for branding.
- **Grid**: 25mm left margin (punch mark align), 20mm right margin.
- **Cost Table**: A formatted table for the breakdown of § 97 Abs. 2 UrhG claims.

---

## Phase 4: Enclosure Support (Unterlassungserklärung)
A key part of the CETI workflow is the **Cease and Desist Declaration**.

- **Automation**: Pre-filling the declaration with the same placeholders used in the letter.
- **Signature Section**: Specific layout for hand-signed acceptance.

---

## Next Steps for Implementation
1. **Update CSS**: Enhance `index.html` to support CETI branding and multi-page layouts.
2. **Logic Layer**: Add RVG calculation utilities.
3. **Data Layer**: Extend CSV mapping for legal fields.
4. **Preview**: Refine the live view to reflect printed letterhead.
