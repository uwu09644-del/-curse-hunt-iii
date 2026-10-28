// Copies the Page Reader web app into www/ for the Android build, with the
// text scanner (Tesseract) and English language data bundled so it works offline.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const www = path.join(__dirname, 'www');
const mods = path.join(__dirname, 'node_modules');

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(path.join(www, 'vendor', 'core'), { recursive: true });
fs.mkdirSync(path.join(www, 'vendor', 'lang'), { recursive: true });

for (const f of ['manifest.json', 'icon.svg']) fs.copyFileSync(path.join(root, f), path.join(www, f));

const copy = (from, to) => fs.copyFileSync(path.join(mods, from), path.join(www, 'vendor', to));
copy('tesseract.js/dist/tesseract.min.js', 'tesseract.min.js');
copy('tesseract.js/dist/worker.min.js', 'worker.min.js');
for (const f of ['tesseract-core-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js']) copy('tesseract.js-core/' + f, 'core/' + f);
copy('@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', 'lang/eng.traineddata.gz');

const cdn = '<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js"></script>';
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!html.includes(cdn)) throw new Error('Tesseract script tag not found in index.html');
html = html.replace(cdn, '<script>window.OCR_LOCAL = true;</script>\n<script src="vendor/tesseract.min.js"></script>');
fs.writeFileSync(path.join(www, 'index.html'), html);

console.log('Web app copied to', www);
