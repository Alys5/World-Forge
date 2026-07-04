import os
import json
import sys

def check_mojibake(file_path):
    mojibake_markers = ['â€', 'Ã', 'â€™']
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            for marker in mojibake_markers:
                if marker in content:
                    return f"Mojibake marker '{marker}' found."
    except UnicodeDecodeError:
        return "Not valid UTF-8 encoding."
    return None

def validate_json_and_logic(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
            # Check Cards
            if 'data' in data and 'system_prompt' in data['data']:
                sys_prompt = data['data'].get('system_prompt', '')
                post_hist = data['data'].get('post_history_instructions', '')
                
                if sys_prompt and '{{original}}' not in sys_prompt:
                    return "Missing {{original}} in system_prompt."
                if post_hist and '{{original}}' not in post_hist:
                    return "Missing {{original}} in post_history_instructions."
            
            # Check Lorebooks (arrays of entries or dict with entries)
            entries = None
            if isinstance(data, dict) and 'entries' in data:
                entries = data['entries']
            elif isinstance(data, list):
                entries = data
                
            if entries:
                uids = set()
                for entry in entries:
                    if 'uid' in entry:
                        uid = entry['uid']
                        if uid in uids:
                            return f"Duplicate UID found: {uid}"
                        uids.add(uid)
                    
                    if 'position' in entry:
                        pos = entry['position']
                        if not isinstance(pos, int) or not (0 <= pos <= 7):
                            return f"Invalid position enum: {pos}"
            
    except json.JSONDecodeError as e:
        return f"JSON Parse Error: {str(e)}"
    return None

def validate_export(export_dir):
    print(f"Validating export directory: {export_dir}")
    errors = []
    
    for root, dirs, files in os.walk(export_dir):
        for file in files:
            if file.endswith('.json'):
                path = os.path.join(root, file)
                
                # Check UTF-8/Mojibake
                mojibake_err = check_mojibake(path)
                if mojibake_err:
                    errors.append(f"[FAIL] {path}: {mojibake_err}")
                    continue
                
                # Check JSON and specific rules
                logic_err = validate_json_and_logic(path)
                if logic_err:
                    errors.append(f"[FAIL] {path}: {logic_err}")
                else:
                    print(f"[PASS] {file}")

    if errors:
        print("\nValidation Failed with the following errors:")
        for err in errors:
            print(err)
        sys.exit(1)
    else:
        print("\nAll checks passed. Export is clean.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_export.py <Export_Dir>")
        sys.exit(1)
    validate_export(sys.argv[1])
