// Writes an episode's voice script (voice/lines-epNN.json) from its script file, for make_voices.py.
// usage: node tools/episode_lines.js js/ep02.js voice/lines-ep02.json
const D = require('../js/director.js'), S = require(require('path').resolve(process.argv[2]));
const say = { Takuto: 'Tah-koo-toh', Nemu: 'Neh-moo', Haruki: 'Hah-roo-kee', Kirishima: 'Kee-ree-shee-mah', Akuro: 'Ah-koo-roh', Sieg: 'Seeg', Shinjo: 'Sheen-joh', Nerima: 'Neh-ree-mah', Ashveil: 'Ash-vale' };
const fix = t => Object.entries(say).reduce((a, [k, v]) => a.replace(new RegExp('\\b' + k + '\\b', 'g'), v), t);
const lines = D.lines(S).map(l => ({ id: l.id, who: l.who, text: l.text, ...(fix(l.tts || l.text) !== l.text ? { tts: fix(l.tts || l.text) } : {}), ...(l.who === 'AKURO' || /preview/.test(l.scene || '') ? { mono: true } : {}) }));
const pv = new Set(D.lines({ ...S, coldOpen: [], partA: [], partB: [], postCredits: [] }).map(l => l.id)); lines.forEach(l => { if (pv.has(l.id)) l.mono = true; });
require('fs').writeFileSync(process.argv[3], JSON.stringify({ cast: S.cast, lines }, null, 1));
console.log(lines.length, 'lines');
