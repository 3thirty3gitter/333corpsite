
import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Missing env vars")
    exit(1)

supabase = create_client(url, key)
response = supabase.table("documents").select("*").execute()
print(f"Count: {len(response.data)}")
for doc in response.data:
    print(f"- {doc['title']} ({doc['category']})")
