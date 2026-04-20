# Task-Plan Verification System

## Overview

The task-plan verification system automatically checks that completed task implementations match the corresponding plan specifications. When a task is marked as completed, the system:

1. **Identifies the associated plan** — searches `docs/superpowers/plans/` for the matching plan file
2. **Extracts checklist items** — parses the plan's task checklist
3. **Verifies implementation** — checks git changes to confirm all plan items are implemented
4. **Reports gaps** — notifies if any plan items are missing from the implementation

## How It Works

### Automatic Verification (Agent Hook)

When you mark a task as completed via `TaskUpdate`, the hook automatically triggers:

```bash
# Mark task as completed
TaskUpdate taskId=123 status=completed
```

This triggers the `TaskCompleted` hook which runs a verification agent that:
- Reads your plan files from `docs/superpowers/plans/`
- Parses checklist items: `- [ ] Step 1`, `- [x] Step 2`, etc.
- Checks recent git diffs to verify implementation
- Reports back with:
  - ✓ Completed items from the plan
  - ✗ Missing items from the plan (developer is notified)
  - ⚠ Additional work done beyond the plan

### Manual Verification Script

For offline or detailed verification, use the helper script:

```bash
./hooks/verify-plan-implementation.sh "Your Task Name"
```

This shows:
- Plan checklist items
- Recent git changes
- Helpful tips for manual review

## Plan File Format

Plans must follow the standard format with clear checklist items:

```markdown
# Task Title Implementation Plan

## Task 1: Create Something

**Files:**
- Create: `src/new-file.ts`

- [ ] **Step 1:** Description of work
  
  ```typescript
  // Code snippet
  ```

- [ ] **Step 2:** Another step

## Task 2: Modify Something

- [ ] **Step 1:** Update configuration
```

The verification system looks for:
- **Checkbox items** (`[ ]`, `[x]`, `[X]`) — marks progress
- **File references** (`Create:`, `Modify:`, `Delete:`) — what to verify
- **Task structure** — groups related work

## Verification Flow

```
Developer marks task complete
           ↓
  TaskCompleted hook fires
           ↓
  Agent reads plan file
           ↓
  Agent extracts checklist
           ↓
  Agent checks git changes
           ↓
  Report gaps to developer
           ↓
  Dev fixes missing items
           ↓
  Task complete ✓
```

## Configuration

The hook is configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "TaskCompleted": [
      {
        "hooks": [
          {
            "type": "agent",
            "prompt": "Verify task implementation against plan...",
            "statusMessage": "Verifying task against plan",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

**Key fields:**
- `type: "agent"` — runs an LLM-powered verification
- `prompt` — instructions for what to check
- `statusMessage` — shown in spinner while verifying
- `timeout: 60` — max seconds for verification (may need adjustment for large changes)

## Handling Verification Failures

If the hook detects missing implementations:

### Case 1: Partial Completion
```
✗ Missing from plan:
  - [ ] Step 3: Add error handling
  - [ ] Step 4: Write unit tests
```

**Action:** Continue working on remaining items and mark task complete again.

### Case 2: Plan and Implementation Mismatch
```
⚠ Implementation differs from plan:
  - Plan says: Modify file A
  - Actual: Also modified file B
```

**Action:** Either update the plan to match reality, or adjust implementation to match plan.

### Case 3: No Plan Found
```
⚠ No plan files found mentioning this task
```

**Action:** Create a plan file or run verification manually using the script.

## Best Practices

### 1. Link Tasks to Plans
Use consistent task names between:
- Task created via `TaskCreate`
- Plan file name or task heading
- Task description

**Example:**
```bash
# Create task
TaskCreate subject="Implement spec reviewer" \
  description="Per docs/superpowers/plans/2026-01-22-spec-reviewer.md"
```

### 2. Update Plans as You Go
When implementation diverges from the plan:
- Update the plan checklist (`[ ]` → `[x]`)
- Or adjust the implementation
- Keep them in sync

### 3. Use Clear Checklist Items
Good checklist items are:
```markdown
- [ ] Create `src/reviewer.ts` with ReviewerClass
- [ ] Add integration tests in `src/reviewer.spec.ts`
- [ ] Document usage in README
```

Not:
```markdown
- [ ] Do the thing
- [ ] Make it work
```

### 4. Run Manual Verification
Before marking complete, manually verify:

```bash
# See what changed
git diff HEAD~10

# Run helper script
./hooks/verify-plan-implementation.sh "Your Task Name"

# Mark complete
TaskUpdate taskId=123 status=completed
```

## Disabling Verification

To temporarily disable the hook for a single task:

1. **Suppress notification** in the chat response
2. **Re-enable later** by reopening `.claude/settings.json`

To permanently disable:

```bash
# Edit settings
vim .claude/settings.json

# Remove or comment out TaskCompleted hooks section
```

## Troubleshooting

### Hook Not Firing
- ✓ Verify `.claude/settings.json` exists
- ✓ Check JSON syntax: `jq . .claude/settings.json`
- ✓ Ensure TaskCompleted event is in hooks
- ✓ Restart Claude Code or press `/hooks` to reload

### Verification Too Slow
- Increase `timeout` in settings.json (default: 60s)
- For very large changes, run manual verification instead

### Can't Find Plans
- ✓ Ensure plans are in `docs/superpowers/plans/`
- ✓ Check file names match task names
- ✓ Verify YAML/Markdown frontmatter is correct

## Examples

### Example 1: Simple Task Completion

**Plan (2026-04-17-add-auth.md):**
```markdown
# Authentication System Implementation

## Task 1: Create Auth Service

- [ ] Create `src/auth/service.ts`
- [ ] Add `authenticate()` method
- [ ] Add unit tests in `src/auth/service.spec.ts`
```

**Completion:**
```bash
TaskUpdate taskId=1 status=completed
# Hook verifies all 3 items implemented
# ✓ All items complete → Task marked done
```

### Example 2: Partial Completion

**Result:**
```
✗ Missing from plan:
  - [ ] Add unit tests in `src/auth/service.spec.ts`

Action: Complete remaining tests and re-mark task
```

## Integration with GitNexus Guard

This system complements the GitNexus Guard rules:
- **Plans** define what should change (specs + plans in `docs/superpowers/`)
- **Verification** ensures it actually changed
- **Guard** prevents overlapping/conflicting changes

Together they form a complete change management system:
1. Create spec + plan (GitNexus detects overlaps)
2. Implement changes
3. Verify against plan (this system)
4. Guard prevents drift (GitNexus monitors)

## See Also

- [GitNexus Guard Rules](gitnexus-guard.md) — Detect architectural drift
- [Spec-Driven Development](../#spec-driven-development-sdd) — From CLAUDE.md
- [Plan Files](../../plans/) — Existing implementation plans
