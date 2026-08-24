import re
import json

def extract():
    with open('src/lib/site-content.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    matches = re.findall(r'(?:title|eyebrow|body|intro|meta|nav):\s*"(.*?)"', content)
    with open('extracted_strings.json', 'w', encoding='utf-8') as f:
        json.dump(list(set(matches)), f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    extract()
