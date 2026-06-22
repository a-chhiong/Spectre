import re

with open('output/dbml/Ecommerce.dbml', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add 'products' to the first block if it's missing
if 'table=products' not in content.split('\n\n')[1]:
    lines = content.splitlines()
    products_link = '// - https://dbdocs.io/Holistics/Ecommerce?table=products&schema=product&view=table_structure'
    idx = -1
    for i, l in enumerate(lines[8:26]):
        if 'table=categories' in l:
            idx = 8 + i
            break
    if idx != -1:
        lines.insert(idx, products_link)
    content = '\n'.join(lines)

# 2. Extract all URLs from the file
urls = {}
for match in re.finditer(r'// - (https://dbdocs\.io/\S+table=([^&]+)&schema=([^&]+)\S+)', content):
    url = match.group(1)
    table = match.group(2)
    schema = match.group(3)
    urls[f'{schema}.{table}'] = url

# 3. Add URL to each Table's Note block
for schema_table, url in urls.items():
    schema, table = schema_table.split('.')
    table_pattern = re.compile(rf'(Table\s+{re.escape(schema_table)}\s+{{.*?Note:\s+\'\'\'.*?)(\'\'\')', re.DOTALL)
    def repl(m):
        if 'URL: https://' not in m.group(1):
            return f'{m.group(1)}  - URL: {url}\n  {m.group(2)}'
        return m.group(0)
    content = table_pattern.sub(repl, content)

# 4. Ensure TableGroups match URLs
if 'TableGroup "User Management"' not in content:
    table_groups = '''
TableGroup "User Management" {
  core.users
}

// ===== TABLEGROUPS =====
'''
    content = content.replace('// ===== TABLEGROUPS =====\n', table_groups)

with open('output/dbml/Ecommerce.dbml', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
