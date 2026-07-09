const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');

const docsDir = path.join(__dirname, 'documents');

async function extractDocx(filename) {
    try {
        const result = await mammoth.extractRawText({ path: path.join(docsDir, filename) });
        console.log(`\n--- ${filename} ---\n`);
        console.log(result.value.substring(0, 3000)); // Print up to 3000 chars
    } catch (e) {
        console.error(`Error reading ${filename}:`, e.message);
    }
}

async function extractPdf(filename) {
    try {
        const dataBuffer = fs.readFileSync(path.join(docsDir, filename));
        const data = await pdf(dataBuffer, { max: 3 }); // Parse up to 3 pages
        console.log(`\n--- ${filename} ---\n`);
        console.log(data.text.substring(0, 3000));
    } catch (e) {
        console.error(`Error reading ${filename}:`, e.message);
    }
}

async function main() {
    await extractDocx('Block DAO Label (BDL) Token Issuance Plan (Last Update 2026-06-17) (EN).docx');
    await extractDocx('Block Label Creator DAO NFT Certificate Issuance Plan 2026-06-19 (EN).docx');
    await extractPdf('Block DAO Label Foundation White paper 1.0 EN.pdf');
}

main();
