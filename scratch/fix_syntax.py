import re

with open('src/lib/i18n.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '    // --- Remaining form & placeholder translations ---'
if start_marker in content:
    idx_start = content.index(start_marker)
    # The bad block ends at `};\n  const t = (s: string) =>`
    # Let's find `  const t = (s: string) =>`
    idx_end = content.index('  const t = (s: string) =>', idx_start)
    
    bad_block = content[idx_start:idx_end]
    
    # Remove bad block
    content = content[:idx_start] + content[idx_end:]
    
    # Now we need to insert it correctly at the end of `kr`.
    # `kr` ends right before `export function I18nProvider`
    kr_end_marker = '};\n\nexport function I18nProvider'
    if kr_end_marker in content:
        # We need to strip the leading spaces from bad_block and format it properly
        clean_bad = bad_block.replace('};\n', '')
        # re-indent
        clean_bad = '\n'.join(['  ' + line.lstrip() for line in clean_bad.split('\n') if line.strip() != ''])
        
        # inject
        content = content.replace(kr_end_marker, clean_bad + '\n' + kr_end_marker)
        
        with open('src/lib/i18n.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print('Fixed syntax and placement!')
    else:
        print('Could not find kr end marker')
else:
    print('Could not find bad block')
