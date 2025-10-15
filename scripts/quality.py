#!/usr/bin/env python3
"""
Alofoke.ai Quality Control Pipeline
Reviews drafts and moves approved ones to publication queue
"""

import os
import json
import re
from pathlib import Path
import argparse
from openai import OpenAI
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Configuration
DATA_DIR = Path("data")
DRAFTS_DIR = DATA_DIR / "drafts"
APPROVED_DIR = DATA_DIR / "approved"
QUEUE_DIR = DATA_DIR / "queue"

# Quality checks
QUALITY_CRITERIA = {
    "length": {
        "news_brief": (250, 450),
        "explainer": (550, 850),
        "trend_radar": (450, 750)
    },
    "required_sections": ["Por qué importa"],
    "html_tags": ["<p>", "<h2>"],
    "min_sources": 1
}

def load_drafts():
    """Load all draft articles"""
    draft_files = list(DRAFTS_DIR.glob("*.json"))
    drafts = []
    
    for dfile in draft_files:
        with open(dfile, 'r', encoding='utf-8') as f:
            draft = json.load(f)
            draft["_filepath"] = dfile
            drafts.append(draft)
    
    return drafts

def check_length(content, article_type):
    """Check if article length is within acceptable range"""
    text = re.sub(r'<[^>]+>', '', content)  # Strip HTML
    word_count = len(text.split())
    
    min_words, max_words = QUALITY_CRITERIA["length"][article_type]
    
    if min_words <= word_count <= max_words:
        return True, word_count
    else:
        return False, word_count

def check_required_sections(content):
    """Check if required sections are present"""
    missing = []
    for section in QUALITY_CRITERIA["required_sections"]:
        if section.lower() not in content.lower():
            missing.append(section)
    return len(missing) == 0, missing

def check_html_quality(content):
    """Check HTML structure quality"""
    issues = []
    
    # Check for required tags
    for tag in QUALITY_CRITERIA["html_tags"]:
        if tag not in content:
            issues.append(f"Missing {tag}")
    
    # Check for malformed HTML (simple check)
    open_tags = len(re.findall(r'<p>', content))
    close_tags = len(re.findall(r'</p>', content))
    if open_tags != close_tags:
        issues.append("Mismatched <p> tags")
    
    return len(issues) == 0, issues

def check_sources(sources):
    """Check if sources are provided and valid"""
    if not sources or len(sources) < QUALITY_CRITERIA["min_sources"]:
        return False, "Insufficient sources"
    
    # Check if sources are valid URLs
    valid = all(s.startswith("http") for s in sources)
    return valid, "OK" if valid else "Invalid source URLs"

def get_embedding(text, model="text-embedding-3-small"):
    """Get OpenAI embedding for text"""
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    try:
        response = client.embeddings.create(
            model=model,
            input=text[:8000]  # Limit input length
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"❌ Embedding error: {e}")
        return None

def check_similarity_with_queue(draft):
    """Check if draft is too similar to queued articles"""
    # Load queue articles
    queue_files = list(QUEUE_DIR.glob("*.json"))
    queue_articles = []
    
    for qfile in queue_files:
        with open(qfile, 'r', encoding='utf-8') as f:
            data = json.load(f)
            queue_articles.extend(data.get("articles", []))
    
    if not queue_articles:
        return True, 0.0  # No queue to compare against
    
    # Get embeddings
    draft_text = f"{draft['title']} {draft['subtitle']}"
    draft_emb = get_embedding(draft_text)
    
    if draft_emb is None:
        return True, 0.0  # Skip if embedding fails
    
    # Compare with queue articles
    max_similarity = 0.0
    for qa in queue_articles[:10]:  # Check only first 10 for speed
        qa_text = f"{qa.get('title', '')} {qa.get('summary', '')}"
        qa_emb = get_embedding(qa_text)
        
        if qa_emb:
            similarity = cosine_similarity([draft_emb], [qa_emb])[0][0]
            max_similarity = max(max_similarity, similarity)
    
    # Threshold: 0.85 = very similar
    is_unique = max_similarity < 0.85
    return is_unique, max_similarity

def calculate_quality_score(draft):
    """Calculate overall quality score (0-1)"""
    checks = {
        "length": 0.25,
        "sections": 0.2,
        "html": 0.15,
        "sources": 0.2,
        "similarity": 0.2
    }
    
    score = 0.0
    issues = []
    
    # Length check
    length_ok, word_count = check_length(draft["content"], draft["type"])
    if length_ok:
        score += checks["length"]
    else:
        issues.append(f"Word count: {word_count} (expected {QUALITY_CRITERIA['length'][draft['type']]})")
    
    # Required sections
    sections_ok, missing = check_required_sections(draft["content"])
    if sections_ok:
        score += checks["sections"]
    else:
        issues.append(f"Missing sections: {', '.join(missing)}")
    
    # HTML quality
    html_ok, html_issues = check_html_quality(draft["content"])
    if html_ok:
        score += checks["html"]
    else:
        issues.extend(html_issues)
    
    # Sources
    sources_ok, source_msg = check_sources(draft.get("sources", []))
    if sources_ok:
        score += checks["sources"]
    else:
        issues.append(source_msg)
    
    # Similarity check (skip if OpenAI key missing)
    if os.getenv("OPENAI_API_KEY"):
        unique, similarity = check_similarity_with_queue(draft)
        if unique:
            score += checks["similarity"]
        else:
            issues.append(f"Too similar to existing content ({similarity:.2f})")
    else:
        # Give benefit of doubt if can't check
        score += checks["similarity"]
    
    return score, issues

def review_drafts(threshold=0.80):
    """Review all drafts and approve/flag them"""
    print("\n🔍 Starting quality review...")
    
    drafts = load_drafts()
    if not drafts:
        print("⚠️  No drafts to review")
        return
    
    print(f"📥 Reviewing {len(drafts)} drafts...")
    
    approved_count = 0
    flagged_count = 0
    
    for draft in drafts:
        print(f"\n📄 {draft['title'][:50]}...")
        
        score, issues = calculate_quality_score(draft)
        
        print(f"  Quality score: {score:.2f}")
        
        if issues:
            print(f"  Issues found:")
            for issue in issues:
                print(f"    • {issue}")
        
        # Update draft metadata
        draft["quality_score"] = score
        draft["quality_issues"] = issues
        
        # Tier adjustment based on quality
        if draft["tier"] == "gold" and score < 0.90:
            draft["low_confidence"] = True
            print(f"  ⚠️  Gold tier article needs human review (score < 0.90)")
        
        # Approve or flag
        if score >= threshold:
            # Move to approved
            APPROVED_DIR.mkdir(parents=True, exist_ok=True)
            approved_path = APPROVED_DIR / draft["_filepath"].name
            
            with open(approved_path, 'w', encoding='utf-8') as f:
                json.dump(draft, f, ensure_ascii=False, indent=2)
            
            # Delete from drafts
            draft["_filepath"].unlink()
            
            approved_count += 1
            print(f"  ✅ APPROVED")
        else:
            flagged_count += 1
            print(f"  ❌ FLAGGED (score {score:.2f} < {threshold})")
            
            # Save updated draft with issues
            with open(draft["_filepath"], 'w', encoding='utf-8') as f:
                json.dump(draft, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Review complete:")
    print(f"  • Approved: {approved_count}")
    print(f"  • Flagged: {flagged_count}")
    print(f"  • Total: {len(drafts)}")

def main():
    parser = argparse.ArgumentParser(description="Quality check articles")
    parser.add_argument("--threshold", type=float, default=0.80,
                       help="Quality score threshold (0-1, default 0.80)")
    
    args = parser.parse_args()
    
    print("🤖 Alofoke.ai Quality Control Pipeline")
    print("=" * 50)
    
    review_drafts(args.threshold)

if __name__ == "__main__":
    main()
