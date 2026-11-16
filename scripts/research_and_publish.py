import os
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone

DATA_FILE = "data/discoveries.json"

def get_gemini_api_key():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is missing.")
    return api_key

def fetch_and_verify_discoveries(api_key):
    # Gemini models endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    prompt = """
    You are an autonomous research and fact-checking AI agent dedicated to documenting genuine discoveries from Pakistan.
    Your mission:
    1. Research recent or notable discoveries announced across any region of Pakistan (Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Gilgit-Baltistan, Azad Kashmir, Islamabad).
    2. Categories include: Archaeology, Paleontology, Biodiversity (new species of flora/fauna), Geological/Mineral, Astronomy/Space, Scientific Breakthroughs, Cultural Heritage findings.
    3. Rigorously verify each finding: Confirm it is an authentic, recognized discovery, research paper, museum finding, university study, or official institutional announcement. Do not include rumors, political stories, or generic non-discovery news.
    4. Provide 1 to 3 distinct, high-quality discoveries.

    Return ONLY a valid JSON array of objects. Do not wrap in markdown quotes if possible, or provide raw JSON only.
    Each object must have exactly these keys:
    - "title": (string) Clear, concise title of the discovery
    - "category": (string) e.g., "Archaeology", "Biodiversity", "Paleontology", "Geology", "Science"
    - "region": (string) Must be one of: "punjab", "sindh", "kpk", "balochistan", "gb", "ajk", "isb"
    - "location": (string) Specific district, valley, site, or city (e.g., "Cholistan Desert, Punjab")
    - "summary": (string) 2 to 3 sentences explaining what was found, who found it, and its significance.
    - "source": (string) Verifiable source, journal, university, or official department (e.g., "Department of Archaeology & Museums", "WWF-Pakistan", "Quaid-i-Azam University")
    - "date_reported": (string) approximate or exact date (e.g. "Nov 2024" or current date)
    """

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            candidate = res_data["candidates"][0]["content"]["parts"][0]["text"]
            # Parse candidate text as JSON
            discoveries = json.loads(candidate.strip())
            return discoveries
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"Gemini API error: {e.code} - {error_body}")
        raise e

def update_discoveries():
    api_key = get_gemini_api_key()
    print("Initiating automated AI research and verification via Gemini...")
    new_findings = fetch_and_verify_discoveries(api_key)

    if not isinstance(new_findings, list):
        print("API output was not a list. Skipping update.")
        return False

    print(f"Researched & verified {len(new_findings)} discovery candidate(s).")

    # Load existing discoveries
    existing = []
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                existing = json.load(f)
        except Exception as e:
            print(f"Error loading existing discoveries: {e}")
            existing = []

    existing_titles = {d.get("title", "").strip().lower() for d in existing}

    added_count = 0
    now_iso = datetime.now(timezone.utc).isoformat()

    for item in new_findings:
        title = item.get("title", "").strip()
        if not title:
            continue
        if title.lower() in existing_titles:
            print(f"Duplicate discovery detected, skipping: {title}")
            continue

        item["id"] = f"disc_{int(datetime.now(timezone.utc).timestamp())}_{added_count}"
        item["published_at"] = now_iso
        item["verified"] = True
        existing.insert(0, item)
        existing_titles.add(title.lower())
        added_count += 1
        print(f"Verified & Added: {title} ({item.get('region')})")

    if added_count > 0:
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(existing, f, indent=2, ensure_ascii=False)
        print(f"Successfully published {added_count} new verified discovery/discoveries!")
        return True
    else:
        print("No new unique discoveries to add today.")
        return False

if __name__ == "__main__":
    update_discoveries()
