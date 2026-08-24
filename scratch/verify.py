with open('src/lib/i18n.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

print('Apply:', '"Apply for Dealer Consultation"' in content)
print('Find:', '"Find a Dealer Near Me"' in content)
print('Please select:', '"Please select"' in content)
print('Footnote:', 'If you do not consent' in content)
