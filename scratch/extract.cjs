const fs = require('fs');
const content = fs.readFileSync('src/lib/i18n.tsx', 'utf-8');

const kr_start = content.indexOf('const kr: Record<string, string> = {');
const kr_end = content.indexOf('};\n\nexport function I18nProvider');
const kr_code = content.slice(kr_start + 36, kr_end);

const lines = kr_code.split('\n');
const same = [];
for (let line of lines) {
    if (!line.includes(':')) continue;
    let parts = line.split('": "');
    if (parts.length === 2) {
        let k = parts[0].trim().replace(/^"/, '');
        let v = parts[1].trim().replace(/",?$/, '');
        if (k === v && k.length > 5) {
            if (!k.includes('@') && !k.includes('010-')) {
                same.push(k);
            }
        }
    }
}
fs.writeFileSync('scratch/same.json', JSON.stringify(same, null, 2));
