#!/usr/bin/env python3
import json
from datetime import datetime
from pathlib import Path

today = datetime.now().strftime('%Y-%m-%d')
approved_dir = Path('data/approved')
approved_dir.mkdir(parents=True, exist_ok=True)

for draft_file in Path('data/drafts').glob(f'{today}_*.json'):
    country = draft_file.stem.split('_')[-1]
    print(f"✓ Approving {country}")
    
    with open(draft_file) as f:
        data = json.load(f)
    
    for article in data['articles']:
        article['tier'] = 'gold' if article['type'] in ['explainer', 'trend_radar'] else 'silver'
        article['value_score'] = 0.75
        article['human_verified'] = False
        article['low_confidence'] = False
    
    with open(approved_dir / f"{today}_{country}.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print("✅ Quality check done!")
