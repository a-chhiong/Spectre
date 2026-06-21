import json
import re

with open('todo/scraped_data.json', 'r', encoding='utf-8') as f:
    scraped_data = json.load(f)

with open('todo/dbml/Ecommerce.dbml', 'r', encoding='utf-8') as f:
    dbml_content = f.read()

def clean_type(t):
    t = re.sub(r'\nE$', '', t)
    t = re.sub(r'^E\n', '', t)
    t = t.replace('\n', ' ').strip()
    return t

def clean_settings(s):
    if not s or s == '-':
        return ''
    parts = re.split(r'[\n,]', s)
    cleaned = []
    for p in parts:
        p = p.strip()
        if p.upper() == 'PK':
            cleaned.append('pk')
        elif p:
            cleaned.append(p)
    return ', '.join(cleaned)

def escape_note(n):
    if not n or n == '-':
        return ''
    return n.replace("'", "\\'").replace('\n', ' ')

new_tables = []
for table_name, data in scraped_data.items():
    block = f"Table {table_name} {{\n"
    
    for col in data.get('columns', []):
        if 'name' not in col:
            continue
            
        cname = col['name']
        ctype = clean_type(col['type'])
        csettings = clean_settings(col['settings'])
        cnote = escape_note(col['note'])
        
        attrs = []
        if csettings:
            attrs.append(csettings)
        if cnote:
            attrs.append(f"note: '{cnote}'")
            
        attr_str = f" [{', '.join(attrs)}]" if attrs else ""
        block += f"  {cname} {ctype}{attr_str}\n"
    
    potential_notes = data.get('potentialNotes', [])
    unique_notes = []
    for n in potential_notes:
        n = n.strip()
        if len(n) > 10 and 'Sign in' not in n and 'dbdocs.io' not in n and n != 'Recent activities':
            is_col_note = any(col.get('note') == n for col in data.get('columns', []))
            if not is_col_note and n not in unique_notes:
                unique_notes.append(n)
                
    if unique_notes:
        block += "\n  Note: '''\n"
        for n in unique_notes:
            block += f"  {n}\n"
        block += "  '''\n"
        
    block += "}\n"
    new_tables.append(block)

new_tables_str = "\n".join(new_tables)

# Locate tables section by regex
# Tables section is between "// ===== TABLES =====" and "TableGroup "User Management""
pattern = re.compile(r'(// ===== TABLES =====\n\n.*?// --- CORE ---\n)(.*?)(\nTableGroup "User Management")', re.DOTALL)

match = pattern.search(dbml_content)
if match:
    new_dbml = dbml_content[:match.start(2)] + new_tables_str + dbml_content[match.start(3):]
    with open('todo/dbml/Ecommerce.dbml', 'w', encoding='utf-8') as f:
        f.write(new_dbml)
    print("Successfully replaced tables in Ecommerce.dbml")
else:
    print("Could not find the table section in Ecommerce.dbml")
