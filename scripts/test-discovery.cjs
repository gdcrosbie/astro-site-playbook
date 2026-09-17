const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

function read(relativePath) {
  const file = path.join(dist, relativePath);
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

const notFoundPage = documentFor('404.html');
assert.equal(notFoundPage.querySelector('meta[name="robots"]')?.getAttribute('content'), 'noindex, nofollow');

const sitemap = read('sitemap-0.xml');
assert.match(sitemap, /<loc>https:\/\/example\.com\/<\/loc>/);
assert.doesNotMatch(sitemap, /404/);

// Editorial posts are optional. Derive expectations from src/content/posts so a project can
// remove the sample post (and RSS) without rewriting this test, while a project that keeps
// posts still gets article, sitemap and feed coverage for every post.
const postsDir = path.join(root, 'src', 'content', 'posts');
const postSlugs = fs.existsSync(postsDir)
  ? fs.readdirSync(postsDir).filter((file) => /\.mdx?$/.test(file)).map((file) => file.replace(/\.mdx?$/, ''))
  : [];
const hasRssRoute = ['rss.xml.ts', 'rss.xml.js'].some((file) => fs.existsSync(path.join(root, 'src', 'pages', file)));

for (const slug of postSlugs) {
  const article = documentFor(`posts/${slug}/index.html`);
  assert.equal(article.querySelector('meta[property="og:type"]')?.getAttribute('content'), 'article', `Expected posts/${slug}/ to be an article`);
  assert.match(
    article.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ?? '',
    /^\d{4}-\d{2}-\d{2}T/,
    `Expected posts/${slug}/ to carry article:published_time`,
  );
  assert.match(sitemap, new RegExp(`<loc>https://example\\.com/posts/${slug}/</loc>`), `Expected posts/${slug}/ in the sitemap`);
}

if (hasRssRoute) {
  const rss = read('rss.xml');
  assert.match(rss, /<rss version="2\.0">/);
  for (const slug of postSlugs) {
    assert.match(rss, new RegExp(`https://example\\.com/posts/${slug}/`), `Expected posts/${slug}/ in rss.xml`);
  }
  assert.ok(home.querySelector('link[type="application/rss+xml"]'), 'Expected RSS auto-discovery while the feed exists');
} else {
  assert.ok(!fs.existsSync(path.join(dist, 'rss.xml')), 'Expected no rss.xml once the RSS route is removed');
  assert.equal(home.querySelector('link[type="application/rss+xml"]'), null, 'Expected no RSS auto-discovery link once the feed is removed');
}

console.log(
  `PASS: canonical, social, noindex and sitemap metadata are coherent; ${postSlugs.length} post(s) checked; RSS ${hasRssRoute ? 'published and linked' : 'removed with no auto-discovery link'}.`,
);
