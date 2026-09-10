#!/usr/bin/env bash
# Says nothing unless the published walkthrough has fallen behind the code
# it describes. Silence is the normal outcome: a check that speaks every
# time is one people stop reading.
#
# The walkthrough's own last commit is the marker, so there is no marker
# file to keep in step. Runs on Stop. Never blocks, never fails the turn.
set -uo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
page='docs/walkthrough/walkthrough.html'
[ -f "$root/$page" ] || exit 0
git -C "$root" rev-parse --git-dir >/dev/null 2>&1 || exit 0

synced=$(git -C "$root" log -1 --format=%H -- "$page" 2>/dev/null)
[ -n "$synced" ] || exit 0

# What the walkthrough makes claims about. Keep in step with the watch table
# in docs/walkthrough/README.md.
watch='^(src/lib/|src/middleware\.ts|src/content/studies\.ts|src/app/(api/unlock/|sitemap\.ts|robots\.ts|llms\.txt/)|wrangler\.jsonc|package\.json|next\.config\.mjs|scripts/|\.claude/skills/|\.claude/agents/)'

changed=$(
  {
    git -C "$root" diff --name-only "$synced"..HEAD 2>/dev/null
    git -C "$root" diff --name-only HEAD 2>/dev/null
    git -C "$root" diff --name-only --cached 2>/dev/null
  } | grep -E "$watch" | sort -u
)
[ -n "$changed" ] || exit 0

count=$(printf '%s\n' "$changed" | wc -l | tr -d ' ')
list=$(printf '%s\n' "$changed" | head -4 | paste -sd, - | sed 's/,/, /g')
[ "$count" -gt 4 ] && list="$list, and $((count - 4)) more"

printf '{"systemMessage":"The walkthrough may be out of date: %s file(s) changed since it was last updated (%s). Run the walkthrough-sync skill when convenient."}\n' \
  "$count" "$list"
