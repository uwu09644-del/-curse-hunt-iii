// Lists what an episode needs: VRM cast, creature sprites and painted plates, as three comma lists for make_page.py.
// usage: node tools/ep_assets.js js/ep05.js
const S = require(require('path').resolve(process.argv[2]));
const vrm = new Set(), spr = new Set(), plates = new Set(['ashford_street', 'ashford_night', 'guild_hall']); // OP/ED borrow these
const VRM = ['takuto', 'nemu', 'sieg', 'sable', 'rin', 'valentine', 'clerk', 'wick', 'haruki', 'gideon', 'lucien', 'vesper'];
const walk = v => { if (Array.isArray(v)) { if (v[0] === 'plate' && typeof v[1] === 'string') plates.add(v[1]); v.forEach(walk); } else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
['coldOpen', 'partA', 'partB', 'postCredits', 'preview'].forEach(k => (S[k] || []).forEach(sc => {
  Object.keys(sc.cast || {}).forEach(n => (n.startsWith('m_') ? spr : VRM.includes(n) ? vrm : new Set()).add(n));
  ((sc.envOpts || {}).plates || []).forEach(p => plates.add(p[0])); walk(sc.beats);
}));
['takuto', 'nemu', 'sieg', 'sable'].forEach(n => vrm.add(n)); // the opening and ending always need these
console.log([[...vrm], [...spr], [...plates]].map(a => a.join(',') || '-').join(' '));
