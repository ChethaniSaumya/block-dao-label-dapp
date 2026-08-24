const fs = require('fs');
const content = fs.readFileSync('src/lib/i18n.tsx', 'utf-8');

const badStart = content.indexOf('    // --- Remaining form & placeholder translations ---');
if (badStart === -1) {
    console.log('Bad block not found');
    process.exit(1);
}

const badEnd = content.indexOf('  };\n  const t = (s: string) =>', badStart);

let badBlock = content.slice(badStart, badEnd);
let newContent = content.slice(0, badStart) + content.slice(badEnd);

const krEnd = newContent.indexOf('};\n\nexport function I18nProvider');

badBlock = badBlock.trimEnd() + '\n';
newContent = newContent.slice(0, krEnd) + badBlock + newContent.slice(krEnd);

fs.writeFileSync('src/lib/i18n.tsx', newContent);
console.log('Fixed');
