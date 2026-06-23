import json
import sys

def decode_devalue(data):
    if not isinstance(data, list):
        return data

    resolved = {}

    def walk(index):
        if index in resolved:
            return resolved[index]
        
        val = data[index]
        
        if isinstance(val, dict):
            obj = {}
            resolved[index] = obj
            for k, v in val.items():
                if isinstance(v, int):
                    obj[k] = walk(v)
                else:
                    obj[k] = v
            return obj
        elif isinstance(val, list):
            arr = []
            resolved[index] = arr
            for v in val:
                if isinstance(v, int):
                    arr.append(walk(v))
                else:
                    arr.append(v)
            return arr
        else:
            resolved[index] = val
            return val

    # In devalue, data[0] is the root
    return walk(0)

if __name__ == '__main__':
    with open('output/dbdocs_state.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    decoded = decode_devalue(data)
    with open('output/dbdocs_decoded.json', 'w', encoding='utf-8') as f:
        json.dump(decoded, f, indent=2)
    print("Decoded devalue and saved to output/dbdocs_decoded.json")
