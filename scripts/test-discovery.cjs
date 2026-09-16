const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  const file = path.join(root, 'dist', relativePath);
  assert.ok(fs.existsSync(file), `Expected built output: ${relativePath}`);
  return fs.readFileSync(file, 'utf8');
}

function documentFor(relativePath) {
  return new JSDOM(read(relativePath)).window.document;
}

const home = documentFor('index.html');
assert.equal(home.querySelector('link[rel="canonical"]')?.getAttribute('href'), 'https://example.com/');
assert.equal(home.querySelector('meta[property="og:type"]')?.getAttribute('content'), 'website');
assert.ok(home.querySelector('meta[property="og:image:alt"]')?.getAttribute('content'));
assert.ok(home.querySelector('meta[property="twitter:image:alt"]')?.getAttribute('content'));
assert.equal(home.querySelectorAll('a[href="#"]').length, 0, 'Expected every homepage link to have a real destination');

const article = documentFor('posts/welcome/index.html');
assert.equal(article.querySelector('meta[property="og:type"]')?.getAttribute('content'), 'article');
assert.match(
  article.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ?? '',
  /^\d{4}-\d{2}-\d{2}T/,
);

const notFoundPage = documentFor('404.html');
assert.equal(notFoundPage.querySelector('meta[name="robots"]')?.getAttribute('content'), 'noindex, nofollow');

const sitemap = read('sitemap-0.xml');
assert.match(sitemap, /<loc>https:\/\/example\.com\/<\/loc>/);
assert.match(sitemap, /<loc>https:\/\/example\.com\/posts\/welcome\/<\/loc>/);
assert.doesNotMatch(sitemap, /404/);

const rss = read('rss.xml');
assert.match(rss, /<rss version="2\.0">/);
assert.match(rss, /https:\/\/example\.com\/posts\/welcome\//);

console.log('PASS: canonical, social, article, noindex, sitemap, and RSS discovery metadata are coherent.');
