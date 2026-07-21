import urllib.request
import json
import os

supabase_url = 'https://kbnbcgdqpncchgeflooz.supabase.co'
anon_key = 'sb_publishable_PWw8qGP62U5s_HlMWxZVYQ_v731-yWy'

url = f"{supabase_url}/rest/v1/daily_analytics?select=*&order=date.desc&limit=1000"
req = urllib.request.Request(url, headers={
    'apikey': anon_key,
    'Authorization': f'Bearer {anon_key}'
})

try:
    with urllib.request.urlopen(req) as response:
        if response.status == 200:
            data = json.loads(response.read().decode('utf-8'))
            print(f"Fetched {len(data)} daily_analytics records from Supabase.")
            
            output_dir = os.path.join(os.path.dirname(__file__), '..', 'server', 'data')
            os.makedirs(output_dir, exist_ok=True)
            output_file = os.path.join(output_dir, 'analytics.json')
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Saved to {output_file}")
        else:
            print(f"HTTP Error: {response.status}")
except Exception as e:
    print(f"Error fetching Supabase analytics: {e}")
