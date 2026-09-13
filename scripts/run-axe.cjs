const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const axe = require('axe-core');

const distPath = path.resolve(__dirname, '../dist/index.html');
if (!fs.existsSync(distPath)) {
  console.error('FAIL: dist/index.html not found. Run "npm run build" first.');
  process.exit(1);
}

const html = fs.readFileSync(distPath, 'utf-8');
const dom = new JSDOM(html, {
  runScripts: 'outside-only',
  url: 'http://localhost/'
});

axe.run(dom.window.document.documentElement, {
  rules: {
    'color-contrast': { enabled: true }
  }
}).then(results => {
  console.log('=== AXE AUDIT RESULTS ===');
  console.log('Violations:', results.violations.length);
  console.log('Passes:', results.passes.length);

  if (results.violations.length > 0) {
    console.error('\n--- VIOLATIONS ---');
    results.violations.forEach((v, i) => {
      console.error('[' + (i + 1) + '] ' + v.id + ' (' + v.impact + ') - ' + v.description);
      v.nodes.forEach(n => {
        console.error('    Target:', n.target.join(', '));
        console.error('    HTML:', n.html);
      });
    });
    process.exit(1);
  }

  console.log('\nPASS: 0 accessibility violations found.');
}).catch(err => {
  console.error('Axe error:', err);
  process.exit(1);
});
