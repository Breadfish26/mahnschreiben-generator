const fs = require('fs');

const raw = fs.readFileSync('Mahnschreiben_Generator.json', 'utf8');
const data = JSON.parse(raw);

data.name = "Mahnschreiben_Generator_v2";

// Filter out the "Normalize" node
data.nodes = data.nodes.filter(n => n.name !== 'Normalize');

// Update Assemble Letter code structure
const assembleNode = data.nodes.find(n => n.name === 'Assemble Letter');
assembleNode.parameters.jsCode = `const batch = $input.first().json.body.batch || [];
const results = [];

const modules = {
  INTRODUCTION:
\`Sehr geehrte Damen und Herren,

wir erlauben uns, Sie höflich auf eine noch offene Zahlung aufmerksam zu machen.\`,

  INVOICE_REFERENCE:
\`Unsere Rechnung vom {{invoice_date}} über den Betrag von {{amount}} war gemäß unseren Zahlungsbedingungen bis zum {{due_date}} zur Zahlung fällig. Bis heute konnten wir leider keinen entsprechenden Zahlungseingang verzeichnen.\`,

  DEFAULT_NOTICE_SOFT:
\`Möglicherweise hat diese Rechnung Ihre Aufmerksamkeit bislang nicht erreicht. Wir bitten Sie, den ausstehenden Betrag umgehend auf unser Konto zu überweisen.\`,

  DEFAULT_NOTICE_STRONG:
\`Trotz unserer bereits erfolgten Zahlungserinnerung ist der genannte Betrag bis heute nicht auf unserem Konto eingegangen. Wir müssen Sie daher ausdrücklich mahnen und fordern Sie auf, den Rückstand unverzüglich auszugleichen.\`,

  FINAL_DEADLINE:
\`Wir setzen Ihnen hiermit eine letzte Zahlungsfrist bis zum {{deadline_date}}. Sollte der Betrag bis zu diesem Datum nicht vollständig eingegangen sein, werden wir weitere Maßnahmen einleiten.\`,

  INTEREST_NOTICE:
\`Wir weisen darauf hin, dass gemäß § 288 BGB ab dem Zeitpunkt des Zahlungsverzugs Verzugszinsen in Höhe von 9 Prozentpunkten über dem jeweiligen Basiszinssatz anfallen.\`,

  LEGAL_ACTION_NOTICE:
\`Sollte eine Zahlung bis zum genannten Termin ausbleiben, werden wir die Angelegenheit ohne weitere Ankündigung einem Rechtsanwalt übergeben und gerichtliche Schritte einleiten.\`,

  CLOSING:
\`Wir gehen davon aus, dass es sich um ein Versehen handelt, und sind überzeugt, dass Sie die Angelegenheit umgehend klären werden. Für Rückfragen stehen wir Ihnen jederzeit gerne zur Verfügung.

Mit freundlichen Grüßen

{{creditor_name}}\`,
};

function fill(text, vars) {
  return text.replace(/\\{\\{(\\w+)\\}\\}/g, (_, key) => vars[key] ?? \`[\${key} MISSING]\`);
}

for (const d of batch) {
  const vars = {
    debtor_name:   d.debtor_name,
    creditor_name: d.creditor_name,
    amount:        d.amount,
    invoice_date:  d.invoice_date,
    due_date:      d.due_date,
    deadline_date: d.deadline_date,
  };

  const selected = [];
  selected.push(fill(modules.INTRODUCTION, vars));
  selected.push(fill(modules.INVOICE_REFERENCE, vars));

  if (d.prior_reminder_sent) {
    selected.push(fill(modules.DEFAULT_NOTICE_STRONG, vars));
  } else {
    selected.push(fill(modules.DEFAULT_NOTICE_SOFT, vars));
  }

  if (d.add_final_deadline) {
    selected.push(fill(modules.FINAL_DEADLINE, vars));
  }

  if (d.mention_default_interest) {
    selected.push(fill(modules.INTEREST_NOTICE, vars));
  }

  if (d.mention_legal_action) {
    selected.push(fill(modules.LEGAL_ACTION_NOTICE, vars));
  }

  selected.push(fill(modules.CLOSING, vars));

  const draft = selected.join('\\n\\n');

  results.push({ debtor_name: d.debtor_name, draft: draft, blocks_included: selected.length });
}

// Return as a single item payload so the Respond to Webhook node bundles everything together
return [{ json: { drafts: results } }];
`;

// Fix connections
data.connections = {
  "Webhook": {
    "main": [
      [
        {
          "node": "Assemble Letter",
          "type": "main",
          "index": 0
        }
      ]
    ]
  },
  "Assemble Letter": {
    "main": [
      [
        {
          "node": "Respond to Webhook",
          "type": "main",
          "index": 0
        }
      ]
    ]
  }
};

fs.writeFileSync('Mahnschreiben_Generator_v2.json', JSON.stringify(data, null, 2));
console.log('Mahnschreiben_Generator_v2.json created!');
