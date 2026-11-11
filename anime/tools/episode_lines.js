// Writes an episode's voice script (voice/lines-epNN.json) from its script file, for make_voices.py.
// usage: node tools/episode_lines.js js/ep02.js voice/lines-ep02.json
const D = require('../js/director.js'), S = require(require('path').resolve(process.argv[2]));
const say = { Aoyama: 'Ah-oh-yah-mah', Tennoji: 'Ten-noh-jee', Osaka: 'Oh-sah-kah', onigiri: 'oh-nee-gee-ree', Takuto: 'Tah-koo-toh', Nemu: 'Neh-moo', Haruki: 'Hah-roo-kee', Kirishima: 'Kee-ree-shee-mah', Akuro: 'Ah-koo-roh', Sieg: 'Seeg', Shinjo: 'Sheen-joh', Nerima: 'Neh-ree-mah', Ashveil: 'Ash-vale' };
const fix = t => Object.entries(say).reduce((a, [k, v]) => a.replace(new RegExp('\\b' + k + '\\b', 'g'), v), t);
const lines = D.lines(S).map(l => ({ id: l.id, who: l.who, text: l.text, ...(fix(l.tts || l.text) !== l.text ? { tts: fix(l.tts || l.text) } : {}), ...(l.who === 'AKURO' || /preview/.test(l.scene || '') ? { mono: true } : {}) }));
const pv = new Set(D.lines({ ...S, coldOpen: [], partA: [], partB: [], postCredits: [] }).map(l => l.id)); lines.forEach(l => { if (pv.has(l.id)) l.mono = true; });
// one voice per character for the whole series; an episode's own cast table can override a voice
const SERIES = {
  TAKUTO: { voice: [['am_michael', 0.6], ['am_puck', 0.4]], speed: 1.02 }, NEMU: { voice: [['af_nicole', 0.65], ['af_bella', 0.35]], speed: 1.02 },
  SIEG: { voice: [['bm_george', 1]], speed: 1.06 }, AKURO: { voice: [['am_fenrir', 1]], speed: 0.8, fx: 'demon' }, RIN: { voice: [['af_kore', 0.6], ['bf_emma', 0.4]], speed: 1.05 },
  VALENTINE: { voice: [['bf_isabella', 0.55], ['af_nova', 0.45]], speed: 1.06 }, CLERK: { voice: [['af_aoede', 1]], speed: 1.08 },
  CROWD: { voice: [['am_echo', 1]], speed: 1.04 }, CROWD2: { voice: [['af_river', 1]], speed: 1.04 }, VENDOR: { voice: [['bm_daniel', 1]], speed: 1.08 },
  HUNTER: { voice: [['am_onyx', 1]], speed: 1.0 }, SABLE: { voice: [['bm_fable', 1]], speed: 0.92, fx: 'static' }, WICK: { voice: [['am_puck', 0.5], ['am_liam', 0.5]], speed: 1.12 },
  GIDEON: { voice: [['bm_lewis', 1]], speed: 1.0 }, EXAMINER: { voice: [['bf_alice', 1]], speed: 1.04 },
  HARUKI: { voice: [['am_liam', 0.6], ['am_eric', 0.4]], speed: 1.0 }, LUCIEN: { voice: [['bm_daniel', 0.5], ['am_adam', 0.5]], speed: 0.94 },
  VESPER: { voice: [['bf_lily', 0.6], ['af_sky', 0.4]], speed: 1.0 }, KUROZANE: { voice: [['am_onyx', 0.7], ['am_fenrir', 0.3]], speed: 0.9 },
  OGRE: { voice: [['am_santa', 1]], speed: 0.9, fx: 'demon' }, NARRATOR: { voice: [['bm_george', 0.4], ['am_adam', 0.6]], speed: 0.98 },
};
const cast = { ...SERIES, ...(S.cast || {}) }, missing = [...new Set(lines.map(l => l.who))].filter(w => !cast[w]);
if (missing.length) { console.error('no voice for', missing.join(', ')); process.exit(1); }
require('fs').writeFileSync(process.argv[3], JSON.stringify({ cast, lines }, null, 1));
console.log(lines.length, 'lines');
