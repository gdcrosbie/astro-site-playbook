const fs = require('fs');
const path = require('path');

const tokensPath = path.resolve(__dirname, '../src/styles/tokens.css');
if (!fs.existsSync(tokensPath)) {
  console.error('FAIL: src/styles/tokens.css does not exist.');
  process.exit(1);
}

const content = fs.readFileSync(tokensPath, 'utf-8');

const requiredTokens = [
  '--color-bg',
  '--color-surface',
  '--color-text',
  '--color-muted',
  '--border-subtle',
  '--font-display',
  '--font-body',
  '--text-base',
  '--h1',
  '--h2',
  '--space-m',
  '--space-xl',
  '--gutter',
  '--container-max',
  '--target-touch',
  '--cq-text-m',
  '--cq-card-padding',
  '--cq-gap'
];

const missing = requiredTokens.filter(t => !content.includes(t));

if (missing.length > 0) {
  console.error('FAIL: tokens.css is missing required tokens:\n ', missing.join(', '));
  process.exit(1);
}

console.log('PASS: tokens.css conforms to the Standard Astro Token Schema (Tier 1 & Tier 2).');
