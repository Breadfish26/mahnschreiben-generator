# Implementation Plan: CSV Header Fuzzy Auto-Matching

This document outlines the plan to build "Fuzzy Auto-Matching" (Option 2) directly into the frontend of the Mahnschreiben Generator. Because this is purely a frontend enhancement to process input data robustly, **no changes will be necessary to your n8n workflows**. 

## Objective
To allow clients to upload CSVs using different internal header names (e.g., "Kunde", "Schuldner", "Name") instead of exclusively forcing them to use the strict `debtor_name` schema. 

## Step-by-Step Plan

### 1. Define Alias Mappings
We will create a Javascript dictionary containing our required API fields and an extensive list of common aliases/synonyms for each field in both German and English.

*Example Mapping:*
```javascript
const COLUMN_ALIASES = {
  debtor_name: ['schuldner', 'kunde', 'name', 'debtor', 'empfänger', 'firmenname'],
  creditor_name: ['gläubiger', 'creditor', 'mandant', 'auftraggeber'],
  amount: ['betrag', 'summe', 'amount', 'rechnungssumme', 'offener betrag', 'wert'],
  invoice_date: ['rechnungsdatum', 'datum', 'invoice date', 'belegdatum'],
  // ... mappings for all optional fields ...
};
```

### 2. Implement Header Normalization (Sanitization)
CSV headers can be messy. Before making any logic comparisons, we will implement a normalization function.
- Converts all incoming header strings to lowercase.
- Strips out excess whitespace and special characters (e.g., changing "Rechnungs-Datum " into "rechnungsdatum").

### 3. Write the Mapping Engine Logic
Inside `index.html`, we will write a new function called `autoMapRow(rawRow)`.
Here is the logical flow of the function:
1. Look at a target field (e.g., `debtor_name`).
2. Search through the `rawRow` normalized headers.
3. Check if any header matches the strings in `COLUMN_ALIASES.debtor_name`.
4. If a match is found, extract the value. If no match is found, assign a blank string or `false`.
5. Return a perfectly structured object that the API expects.

### 4. Integration into the existing `generateLetter()` workflow
We will replace the strict Javascript `.map(...)` code we wrote previously. 

**Currently:**
```javascript
debtor_name: row.debtor_name || '',
```

**Will be replaced by:**
```javascript
const mappedRow = autoMapRow(row);
payloadArray.push(mappedRow);
```

---

## Technical Outcomes
- **Zero cost**: Processing happens locally in the user's browser via PapaParse.
- **Backwards compatibility**: If they happen to use the exact names (`debtor_name`), it will still match perfectly.
- **Fail-safes**: If critical data (like amount or names) cannot be matched automatically via the aliases, the required field validation check we already established will block the request and warn the user.

Let me know if this implementation plan looks good or if there are specific proprietary column names you know your clients use which we should include in the alias mapping!
