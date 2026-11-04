const fs = require('fs'), path = require('path');
const [root, out] = process.argv.slice(2);

// Minimal CSV parser for USDA files (quoted fields, commas, doubled quotes).
function parseCSV(file, onRow) {
  const text = fs.readFileSync(file, 'utf8');
  let i = 0, field = '', row = [], inQ = false, header = null;
  const end = () => {
    row.push(field); field = '';
    if (!header) header = row;
    else if (row.length > 1) { const o = {}; header.forEach((h, k) => o[h] = row[k]); onRow(o); }
    row = [];
  };
  for (; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') end();
    else if (c !== '\r') field += c;
  }
  if (field || row.length) end();
}

const NUT = { 1008: 0, 1003: 1, 1004: 2, 1005: 3, 1079: 4, 2000: 5, 1093: 6, 1258: 7, 208: 0, 203: 1, 204: 2, 205: 3, 291: 4, 269: 5, 307: 6, 606: 7 };
const ALT = { 2047: 0, 2048: 0, 1063: 5 };
const r1 = v => Math.round(v * 10) / 10;

function load(dir, src) {
  const foods = new Map();
  parseCSV(path.join(dir, 'food.csv'), r => foods.set(r.fdc_id, { name: r.description.trim(), n: Array(8).fill(null), alt: {}, p: [] }));
  parseCSV(path.join(dir, 'food_nutrient.csv'), r => {
    const fd = foods.get(r.fdc_id); if (!fd || r.amount === '') return;
    const id = +r.nutrient_id;
    if (id in NUT) fd.n[NUT[id]] = +r.amount;
    else if (id in ALT && fd.alt[ALT[id]] == null) fd.alt[ALT[id]] = +r.amount;
  });
  parseCSV(path.join(dir, 'food_portion.csv'), r => {
    const fd = foods.get(r.fdc_id); const g = +r.gram_weight;
    if (!fd || !(g > 0) || fd.p.length >= 6) return;
    let label;
    if (src === 0) {
      let amt = r.amount || '1'; if (!isNaN(+amt)) amt = String(+amt);
      label = (amt + ' ' + (r.modifier || r.portion_description || 'serving')).trim();
    } else {
      label = (r.portion_description || '').trim();
      if (!label || /not specified/i.test(label)) return;
    }
    fd.p.push([label.slice(0, 60), r1(g)]);
  });
  const rows = [];
  for (const [id, fd] of foods) {
    const n = fd.n.map((v, i) => v == null && fd.alt[i] != null ? fd.alt[i] : v);
    if (n[0] == null) continue;
    const vals = n.map((v, i) => v == null ? null : (i === 0 || i === 6) ? Math.round(v) : r1(v));
    rows.push([fd.name, src, +id, ...vals, fd.p]);
  }
  return rows;
}

const sub = d => path.join(root, d, fs.readdirSync(path.join(root, d))[0]);
const sr = load(sub('sr'), 0), fn = load(sub('fn'), 1);
const data = {
  fields: ['name', 'src', 'fdcId', 'kcal', 'protein_g', 'fat_g', 'carbs_g', 'fiber_g', 'sugar_g', 'sodium_mg', 'satfat_g', 'portions[label,g]'],
  per: '100 g',
  sources: ['USDA FoodData Central, SR Legacy (April 2018)', 'USDA FoodData Central, FNDDS survey foods (October 2024)'],
  foods: fn.concat(sr),
};
fs.writeFileSync(out, JSON.stringify(data));
console.log('SR', sr.length, 'FNDDS', fn.length, 'bytes', fs.statSync(out).size);
