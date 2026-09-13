const fs = require('fs');
const path = require('path');

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex) {
  hex = hex.replace('#', '').trim();
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  return [num >> 16, (num >> 8) & 255, num & 255].map(v => v / 255);
}

function rgbToOklch(r, g, b) {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.sqrt(a * a + b_ * b_);
  let H = Math.atan2(b_, a) * (180 / Math.PI);
  if (H < 0) H += 360;
  return { L, C, H };
}

function oklchToLuminance(L, C, h) {
  const hRad = (h * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  return Math.max(0, 0.2126 * lr + 0.7152 * lg + 0.0722 * lb);
}

const tokensPath = path.resolve(__dirname, '../src/styles/tokens.css');
if (!fs.existsSync(tokensPath)) {
  console.error('FAIL: tokens.css not found.');
  process.exit(1);
}

const tokensCss = fs.readFileSync(tokensPath, 'utf-8');

// Parse all CSS custom properties in :root
const vars = {};
const varRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
let match;
while ((match = varRegex.exec(tokensCss)) !== null) {
  vars[match[1]] = match[2].trim();
}

function resolveColor(raw) {
  raw = raw.trim();
  // If reference to another var(--foo)
  const varRef = raw.match(/^var\((--[\w-]+)\)$/);
  if (varRef && vars[varRef[1]]) {
    return resolveColor(vars[varRef[1]]);
  }
  return raw;
}

function getColorLuminance(val) {
  val = resolveColor(val);

  // Hex color
  if (val.startsWith('#')) {
    const [r, g, b] = hexToRgb(val);
    const { L, C, H } = rgbToOklch(r, g, b);
    return oklchToLuminance(L, C, H);
  }

  // Relative OKLCH: oklch(from var(--c-text) 0.50 c h)
  const relOklchMatch = val.match(/oklch\(\s*from\s+var\((--[\w-]+)\)\s+([\d.]+)\s+c\s+h\s*\)/i);
  if (relOklchMatch) {
    const baseVar = relOklchMatch[1];
    const newL = parseFloat(relOklchMatch[2]);
    const baseResolved = resolveColor(vars[baseVar] || '#000000');
    let baseC = 0, baseH = 0;
    if (baseResolved.startsWith('#')) {
      const oklch = rgbToOklch(...hexToRgb(baseResolved));
      baseC = oklch.C;
      baseH = oklch.H;
    } else {
      const baseOklch = baseResolved.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/i);
      if (baseOklch) {
        baseC = parseFloat(baseOklch[2]);
        baseH = parseFloat(baseOklch[3]);
      }
    }
    return oklchToLuminance(newL, baseC, baseH);
  }

  // Direct OKLCH: oklch(0.98 0.006 84.6)
  const directOklchMatch = val.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/i);
  if (directOklchMatch) {
    return oklchToLuminance(
      parseFloat(directOklchMatch[1]),
      parseFloat(directOklchMatch[2]),
      parseFloat(directOklchMatch[3])
    );
  }

  throw new Error(`Unsupported color format: ${val}`);
}

function getContrast(fg, bg) {
  const l1 = getColorLuminance(fg);
  const l2 = getColorLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Contract pairings defined by Standard Astro Token Schema
const colorBg = vars['--color-bg'] || vars['--c-surface'];
const colorSurface = vars['--color-surface'] || vars['--c-surface'];
const colorText = vars['--color-text'] || vars['--c-text'];
const colorMuted = vars['--color-muted'] || vars['--c-text-muted'];
const colorDim = vars['--color-dim'] || vars['--c-text-dim'];
const colorPrimary = vars['--color-primary'] || vars['--c-primary'];

const pairings = [
  { name: '--color-text on --color-bg', fg: colorText, bg: colorBg, min: 4.5 },
  { name: '--color-text on --color-surface', fg: colorText, bg: colorSurface, min: 4.5 },
  { name: '--color-muted on --color-bg', fg: colorMuted, bg: colorBg, min: 4.5 },
  { name: '--color-muted on --color-surface', fg: colorMuted, bg: colorSurface, min: 4.5 },
  { name: '--color-dim on --color-bg', fg: colorDim, bg: colorBg, min: 4.5 },
];

if (colorPrimary) {
  pairings.push({ name: '--color-primary on --color-bg', fg: colorPrimary, bg: colorBg, min: 4.5 });
}

console.log('=== WCAG 2.2 COLOR CONTRAST AUDIT ===\n');
let violations = 0;

pairings.forEach(p => {
  try {
    const ratio = getContrast(p.fg, p.bg);
    const pass = ratio >= p.min;
    const status = pass ? 'PASS' : 'FAIL';
    if (!pass) violations++;
    console.log(`[${status}] ${ratio.toFixed(2)}:1 (req: ${p.min}:1) - ${p.name}`);
  } catch (err) {
    console.error(`[ERROR] ${p.name}: ${err.message}`);
    violations++;
  }
});

console.log(`\nAudit complete: ${pairings.length - violations}/${pairings.length} pairs pass.`);

if (violations > 0) {
  console.error(`\nFAIL: ${violations} contrast violations detected in tokens.css.`);
  process.exit(1);
} else {
  console.log('PASS: 0 contrast violations. All semantic token pairings meet WCAG 2.2 Level AA.');
}
