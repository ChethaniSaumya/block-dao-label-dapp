import re

with open('src/lib/site-content.ts', 'r', encoding='utf-8') as f:
    ts = f.read()

with open('src/lib/i18n.tsx', 'r', encoding='utf-8') as f:
    kr = f.read()

match = re.search(r'consentFootnote:\s*"(.*?)"', ts, re.DOTALL)
if match:
    val = match.group(1).replace('\n', '\\n').replace('"', '\\"')
    print('val:', val)
    if val[:30] in kr:
        print('FOUND in kr')
    else:
        print('NOT FOUND in kr')
        # Let's add it
        val_kr = "마케팅 정보 수신에 동의하지 않으셔도 상담은 정상적으로 진행되며, 향후 사업 설명회, 정책 변경, 프로모션 등 기타 추가 안내에 대한 연락을 받으실 수 없습니다."
        kr = kr.replace('};\n\nexport function I18nProvider', f'  "{val}": "{val_kr}",\n}};\n\nexport function I18nProvider')
        with open('src/lib/i18n.tsx', 'w', encoding='utf-8') as f:
            f.write(kr)
        print('Patched consentFootnote!')
else:
    print('Not found in ts')
