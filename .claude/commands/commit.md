# /commit — GreenRoute Commit and Document

Run after completing any feature, fix, or significant change.

## Part 1: Log the decision

Append to `docs/decisions.md`:

```markdown
## [timestamp] — [Feature/Fix Name]
**What was built:** [1-2 sentences]
**Why this approach:** [key technical or product decision]
**Files changed:** [list]
**Next:** [what this unblocks]
```

## Part 2: Git commit

```bash
git add src/ netlify/ CLAUDE.md docs/ specs/
git commit -m "[type]: [short description]

- [Key change 1]
- [Key change 2]"
```

**Commit types:**
| Type | Use for |
|------|---------|
| `feat` | New feature (GEE analysis, new UI component, emissions calculation) |
| `fix` | Bug fix (API error, broken render, wrong calculation) |
| `data` | GEE script or satellite imagery pipeline change |
| `deploy` | netlify.toml, env var setup |
| `refactor` | Code cleanup, no behavior change |
| `docs` | CLAUDE.md, decisions.md, handoff.md update |

**Examples:**
- `feat: add warehouse density heatmap from Sentinel-2 imagery`
- `fix: handle GEE rate limit with exponential backoff`
- `data: add nighttime lights layer for logistics corridor detection`
- `deploy: set Netlify function timeout to 26s`

## Part 3: Update AI layer (if applicable)

If this session revealed a better way to work:
- New coding pattern → add to `.claude/rules/backend.md` or `frontend.md`
- New GEE strategy → update `.claude/rules/gee-layer.md`
- New architecture decision → update `CLAUDE.md`
