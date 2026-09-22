// Core reference data for "Sharing in a Ratio" (Grade 7, MOE syllabus:
// interpreting ratio notation, finding total parts, calculating the value of
// one part, sharing a quantity in a given ratio, working backwards from one
// share, and solving real-life ratio problems).

// ─── Core helpers ────────────────────────────────────────────────────────────

export function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

// Simplify a ratio of any length, e.g. [6, 9] → [2, 3]
export function simplifyRatio(parts) {
  const g = parts.reduce((acc, p) => gcd(acc, Math.abs(p)), Math.abs(parts[0])) || 1;
  return parts.map(p => p / g);
}

export function totalParts(parts) {
  return parts.reduce((a, b) => a + b, 0);
}

// The value of ONE part when `amount` is shared in ratio `parts`.
export function onePartValue(amount, parts) {
  return amount / totalParts(parts);
}

// The actual share each person receives.
export function shares(amount, parts) {
  const unit = onePartValue(amount, parts);
  return parts.map(p => p * unit);
}

// Format a number cleanly (drop trailing .0)
export function fmt(n) {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 100) / 100);
}

export function ratioLabel(parts) {
  return parts.join(' : ');
}

/**
 * Produces the full, explicit, step-by-step working for sharing `amount` in
 * ratio `parts`. Each step is a { label, detail, result } object so the UI can
 * reveal them one at a time — this is what makes the module "show every step".
 */
export function solveSteps(amount, parts, names = null, unit = '') {
  const tp = totalParts(parts);
  const unitVal = amount / tp;
  const sh = parts.map(p => p * unitVal);
  const who = names || parts.map((_, i) => `Share ${String.fromCharCode(65 + i)}`);

  return [
    {
      label: 'Step 1 — Add the parts',
      detail: `${parts.join(' + ')} = ${tp}`,
      result: `${tp} total parts`,
    },
    {
      label: 'Step 2 — Find ONE part',
      detail: `${fmt(amount)}${unit} ÷ ${tp} = ${fmt(unitVal)}${unit}`,
      result: `1 part = ${fmt(unitVal)}${unit}`,
    },
    {
      label: 'Step 3 — Multiply out each share',
      detail: parts.map((p, i) => `${who[i]}: ${p} × ${fmt(unitVal)} = ${fmt(sh[i])}${unit}`).join('   |   '),
      result: sh.map(s => `${fmt(s)}${unit}`).join(' : '),
    },
    {
      label: 'Step 4 — Check it adds back up',
      detail: `${sh.map(fmt).join(' + ')} = ${fmt(sh.reduce((a, b) => a + b, 0))}${unit}`,
      result: `✓ matches the original ${fmt(amount)}${unit}`,
    },
  ];
}

// ─── The four ideas this module teaches ──────────────────────────────────────

export const RATIO_CONCEPTS = {
  notation: {
    id: 'notation',
    name: 'Ratio Notation',
    shortLabel: 'Notation',
    emoji: '🔗',
    color: '#34D399',
    description: 'A ratio like 2 : 3 compares amounts part-to-part, not part-to-whole.',
    rule: 'Read 2 : 3 as "2 parts to 3 parts". Order matters — 2 : 3 is not the same as 3 : 2.',
    realWorldExamples: ['mixing squash 1 : 4 with water', 'a recipe using 2 : 3 flour to sugar', 'sharing sweets 3 : 5'],
    funFact: 'A ratio has no units of its own — 2 : 3 works for grams, dollars or sweets alike!',
  },
  totalparts: {
    id: 'totalparts',
    name: 'Total Parts',
    shortLabel: 'Total Parts',
    emoji: '➕',
    color: '#A78BFA',
    description: 'Adding the ratio numbers tells you how many equal parts the whole splits into.',
    rule: 'Always ADD the ratio numbers first — 2 : 3 means the whole is cut into 2 + 3 = 5 equal parts.',
    realWorldExamples: ['5 equal parts from a 2 : 3 split', '9 equal parts from a 4 : 5 split'],
    funFact: 'The total parts number is the denominator hiding inside every ratio question!',
  },
  onepart: {
    id: 'onepart',
    name: 'Value of One Part',
    shortLabel: 'One Part',
    emoji: '🧩',
    color: '#FF8A50',
    description: 'Divide the whole amount by the total parts to find what a single part is worth.',
    rule: 'One part = total amount ÷ total parts. This single number unlocks every share.',
    realWorldExamples: ['$50 shared in 2 : 3 → one part = $10', '45 sweets in 4 : 5 → one part = 5 sweets'],
    funFact: 'Once you know one part, every share is just a quick multiplication away!',
  },
  share: {
    id: 'share',
    name: 'Each Share',
    shortLabel: 'Shares',
    emoji: '🎁',
    color: '#4A90D9',
    description: 'Multiply the value of one part by each ratio number to get each person\'s share.',
    rule: 'Share = ratio number × value of one part. Then check all shares add back to the total.',
    realWorldExamples: ['$20 and $30 from a $50 split', '20 and 25 sweets from 45'],
    funFact: 'Your shares must always add back up to the original amount — that is the perfect self-check!',
  },
};

// ─── Real-world scenarios for Simulate Station D and Play World 8 ───────────

export const SCENARIOS = [
  {
    id: 'sweets',
    title: 'Sharing Sweets',
    icon: '🍬',
    amount: 45,
    parts: [4, 5],
    names: ['Aisha', 'Ben'],
    unit: ' sweets',
    context: "Aisha and Ben share 45 sweets in the ratio 4 : 5. How many sweets does each get?",
  },
  {
    id: 'money',
    title: 'Splitting Prize Money',
    icon: '💰',
    amount: 120,
    parts: [1, 2, 3],
    names: ['Cara', 'Dev', 'Eli'],
    unit: '',
    context: "Cara, Dev and Eli split $120 prize money in the ratio 1 : 2 : 3. How much does each receive?",
  },
  {
    id: 'paint',
    title: 'Mixing Paint',
    icon: '🎨',
    amount: 30,
    parts: [2, 3],
    names: ['Blue', 'Yellow'],
    unit: ' L',
    context: "A painter mixes 30 L of green paint using blue and yellow in the ratio 2 : 3. How much of each colour?",
  },
  {
    id: 'recipe',
    title: 'Recipe Flour & Sugar',
    icon: '🍰',
    amount: 800,
    parts: [3, 1],
    names: ['Flour', 'Sugar'],
    unit: ' g',
    context: "A cake uses 800 g of dry mix with flour and sugar in the ratio 3 : 1. How much of each ingredient?",
  },
];

export function getScenario(id) {
  return SCENARIOS.find(s => s.id === id);
}
