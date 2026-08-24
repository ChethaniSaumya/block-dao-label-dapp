const fs = require('fs');

const missing = {
  "Apply for Dealer Consultation": "대리점 상담 신청",
  "Find a Dealer Near Me": "가까운 대리점 찾기",
  "Please select": "선택해 주세요",
  "Individual": "개인",
  "Sole Proprietor": "개인사업자",
  "Corporation": "법인",
  "Up to ₩10M": "1천만원 이하",
  "₩10M–₩30M": "1천만~3천만원",
  "₩30M–₩50M": "3천만~5천만원",
  "₩50M+": "5천만원 이상",
  "Request Tablet Consultation": "태블릿 상담 신청",
  "Dealer Contract Consultation": "대리점 계약 상담",
  "Phone enquiries: 1577-3204": "전화 문의: 1577-3204",
  "1 Year of Education": "1년 교육과정",
  "Content Creation": "콘텐츠 제작",
  "Monthly Challenge": "월간 챌린지",
  "Full Participation": "전면 참여",
  "Monetization Opportunities": "수익화 기회",
  "Country": "국가"
};

let content = fs.readFileSync('src/lib/i18n.tsx', 'utf-8');

let lines = ["  // --- Array translations ---"];
for (const [k, v] of Object.entries(missing)) {
    if (!content.includes('"' + k.split('₩')[0] + '":')) {
       lines.push('  "' + k + '": "' + v + '",');
    }
}
let block = '\n' + lines.join('\n') + '\n';

// Replace using regex to handle both \n and \r\n
content = content.replace(/};\r?\n\r?\nexport function I18nProvider/, block + '};\n\nexport function I18nProvider');

fs.writeFileSync('src/lib/i18n.tsx', content);
