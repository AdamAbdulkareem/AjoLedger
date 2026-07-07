#!/usr/bin/env bash
# Export readable Markdown chat history into .cursor/agent-memory/chats/
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$PROJECT_ROOT/.cursor/agent-memory/chats"
OLD_WORKSPACE="/Users/adamadulkareem/Documents/AjoLedger"
OLD_TRANSCRIPTS="$HOME/.cursor/projects/Users-adamadulkareem-Documents-AjoLedger/agent-transcripts"

mkdir -p "$OUT_DIR"

echo "→ Output: $OUT_DIR"

# --- Method 1: cursor-history (best — full readable Markdown) ---
if command -v npx >/dev/null 2>&1; then
  echo "→ Trying cursor-history export (all sessions)…"
  if npx --yes cursor-history export --all -o "$OUT_DIR/cursor-history" --format markdown 2>/dev/null; then
    echo "✓ Exported via cursor-history to $OUT_DIR/cursor-history/"
  else
    echo "  cursor-history export failed or found no sessions (continuing…)"
  fi
else
  echo "  npx not found — skip cursor-history"
fi

# --- Method 2: agent transcript JSONL → simple Markdown ---
if [[ -d "$OLD_TRANSCRIPTS" ]]; then
  echo "→ Converting agent transcripts from old workspace…"
  CONVERTED=0
  for jsonl in "$OLD_TRANSCRIPTS"/*.jsonl; do
    [[ -f "$jsonl" ]] || continue
    base="$(basename "$jsonl" .jsonl)"
    out="$OUT_DIR/transcript-${base}.md"
    node - "$jsonl" "$out" <<'NODE'
const fs = require('fs');
const [,, inPath, outPath] = process.argv;
const lines = fs.readFileSync(inPath, 'utf8').trim().split('\n').filter(Boolean);
const parts = ['# Agent transcript\n', `> Source: ${inPath}\n`];
for (const line of lines) {
  let row;
  try { row = JSON.parse(line); } catch { continue; }
  const role = row.role || row.type || 'message';
  const text = row.message?.content?.[0]?.text
    ?? row.content
    ?? row.text
    ?? JSON.stringify(row, null, 2);
  parts.push(`\n## ${role}\n\n${String(text).trim()}\n`);
}
fs.writeFileSync(outPath, parts.join(''));
NODE
    CONVERTED=$((CONVERTED + 1))
  done
  echo "✓ Converted $CONVERTED transcript(s) to Markdown"
else
  echo "  No agent-transcripts at $OLD_TRANSCRIPTS"
fi

# --- Index ---
INDEX="$OUT_DIR/INDEX.md"
{
  echo "# Chat exports"
  echo ""
  echo "Generated: $(date -u '+%Y-%m-%d %H:%M UTC')"
  echo ""
  echo "Old workspace: \`$OLD_WORKSPACE\`"
  echo ""
  echo "## Files"
  echo ""
  find "$OUT_DIR" -type f \( -name '*.md' ! -name 'INDEX.md' \) | sort | while read -r f; do
    rel="${f#$OUT_DIR/}"
    echo "- [\`$rel\`](./$rel)"
  done
} > "$INDEX"

echo ""
echo "Done. Open $INDEX"
echo "Next: open $PROJECT_ROOT in Cursor and start a new agent chat."
