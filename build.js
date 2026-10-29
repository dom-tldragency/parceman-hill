// Static site build: wraps each page in the shared layout and writes to dist/.
// Page files start with <!--meta {...} --> holding title, description and nav key.
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const OUT = path.join(__dirname, 'dist');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'site.config.json'), 'utf8'));

const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');
const layout = read('partials/layout.html');
const partials = {
  header: read('partials/header.html'),
  footer: read('partials/footer.html'),
  newsletter: read('partials/newsletter.html'),
  hex: read('partials/hex.html'),
  hexHero: read('partials/hex-hero.html'),
  handbook: read('partials/handbook.html'),
};

function fill(html, vars) {
  return html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const val = key.split('.').reduce((o, k) => (o == null ? o : o[k]), vars);
    return val == null ? '' : String(val);
  });
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(path.join(SRC, 'assets'), path.join(OUT, 'assets'), { recursive: true });

for (const file of fs.readdirSync(path.join(SRC, 'pages'))) {
  if (!file.endsWith('.html')) continue;
  const raw = read(`pages/${file}`);
  const match = raw.match(/^<!--meta\s+([\s\S]*?)-->/);
  if (!match) throw new Error(`${file} is missing its meta block`);
  const meta = JSON.parse(match[1]);
  const slug = file === 'index.html' ? '' : file.replace(/\.html$/, '');

  const vars = {
    ...config,
    year: new Date().getFullYear(),
    page: { ...meta, slug, canonical: `${config.siteUrl}/${slug}` },
  };

  let body = raw.slice(match[0].length).replace('<!-- @newsletter -->', partials.newsletter).replace('<!-- @hex-hero -->', partials.hexHero).replaceAll('<!-- @hex -->', partials.hex);
  let html = layout
    .replace('<!-- @header -->', partials.header)
    .replace('<!-- @content -->', body)
    .replace('<!-- @footer -->', partials.footer)
    .replace('<!-- @handbook -->', partials.handbook);

  html = fill(html, vars);
  if (meta.nav) html = html.replaceAll(`data-nav="${meta.nav}"`, `data-nav="${meta.nav}" aria-current="page"`);
  if (!config.draftBanner) html = html.replace(/<div class="draft"[\s\S]*?<\/div>/, '');

  fs.writeFileSync(path.join(OUT, file), html);
  console.log(`built ${file}`);
}
