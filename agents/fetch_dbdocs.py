import urllib.request
import re
import json
import sys

def main():
    url = 'https://dbdocs.io/Holistics/Ecommerce'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
    except Exception as e:
        print('HTTP error:', e)
        return
        
    match = re.search(r'window\.__INITIAL_STATE__\s*=\s*(.*?);</script>', html, re.DOTALL)
    if match:
        state_str = match.group(1).strip()
        if state_str.startswith("'") and state_str.endswith("'"):
            state_str = state_str[1:-1]
            state_str = state_str.replace("\\'", "'")
        
        try:
            data = json.loads(state_str)
            print("Successfully parsed __INITIAL_STATE__ as JSON. Type:", type(data))
            
            with open('todo/dbdocs_state.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            print("Saved state to todo/dbdocs_state.json")
            
            # Let's inspect data to see if we can extract tables, columns, tablegroups, enums, refs, notes.
            # dbdocs uses a custom compressed state array format (dehydrate).
            # If so, it might be tricky, but we can look at the JSON file.
        except Exception as e:
            print("JSON parse error:", e)
    else:
        print("Could not find __INITIAL_STATE__")

if __name__ == '__main__':
    main()
