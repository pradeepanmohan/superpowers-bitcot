---
name: writing-changelog
description: Use after completing implementation or bug fixes to document changes - called by finishing-a-development-branch, systematic-debugging, or manually when you need to record what changed, how behavior differs before/after, and verification steps
---

# Writing Changelog

## Overview

Document what was implemented or fixed in a structured changelog that captures the essential information for future reference.

**Core principle:** Capture before/after behavior, specific changes, and verification steps - not just what changed, but how things behave differently now.

**Announce at start:** "I'm using the writing-changelog skill to document these changes."

## When to Use

**Called by:**
- `superpowers:finishing-a-development-branch` (Step 1.5) - After feature implementation
- `superpowers:systematic-debugging` (Phase 4, Step 6) - After bug fix verified

**Use manually when:**
- Completing any significant work on a branch
- Need to document changes for review
- Creating release notes from branch work

## The Process

### Step 1: Gather Context

Collect the information needed for the changelog:

```bash
# Get branch name
git rev-parse --abbrev-ref HEAD

# Get current date
date +%Y-%m-%d

# Get commit history on this branch
git log <base-branch>..HEAD --oneline

# Get list of modified files
git diff <base-branch>..HEAD --stat

# Get detailed changes (for understanding before/after)
git diff <base-branch>..HEAD
```

If base branch unknown, use:
```bash
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

### Step 2: Determine Change Scope

Categorize the work:
- **Feature** - New functionality added
- **Fix** - Bug or issue resolved
- **Refactor** - Code structure improved without behavior change
- **Performance** - Optimization without behavior change
- **Docs** - Documentation updates

### Step 3: Identify Change Areas

For each significant change:

1. **What component/area was affected?**
   - API endpoints, data models, UI components, utilities, config, etc.

2. **What was the before state?**
   - How did it behave before this change?
   - What limitations or issues existed?

3. **What is the after state?**
   - How does it behave now?
   - What new capabilities or fixes are in place?

4. **What specific code/config changed?**
   - Files, functions, classes, methods, config keys

### Step 4: Write Changelog

Create the file at: `docs/superpowers/specs/<branch-name>/YYYY-MM-DD-changelog.md`

**Changelog template:**

```markdown
# Changelog: [Feature/Bug Name]

**Type:** [Feature | Fix | Refactor | Performance | Docs]

**Branch:** <branch-name>

**Date:** YYYY-MM-DD

## Summary

[One sentence describing what was implemented or fixed. Be specific - not "improved X" but "added Y to enable Z" or "fixed bug in W that caused V".]

## Changes Made

### [Component/Feature Area 1]

- **Before:** [How it behaved before - specific behavior, limitations, symptoms]
- **After:** [How it behaves now - new behavior, capabilities, resolution]
- **Files changed:** `path/to/file1.ext`, `path/to/file2.ext`
- **Key changes:** [Specific functions, classes, logic that was modified]

[Repeat section for each major change area]

## Files Modified

| File | Change Description |
|------|---------------------|
| `path/to/file.ext` | [What was changed in this file] |

## Commits

| Commit | Description |
|--------|-------------|
| `abc123` | [Brief description of what this commit did] |

## Testing & Verification

**How to verify this works:**
- [Specific test commands to run]
- [Manual verification steps if needed]

**Test results:**
- [Reference to test run output or confirmation]

## Notes

[Any additional context: breaking changes, migration steps, known limitations, follow-up work needed]
```

### Step 5: Commit Changelog

```bash
git add docs/superpowers/specs/<branch-name>/YYYY-MM-DD-changelog.md
git commit -m "docs: add changelog for [feature/bug-name]"
```

**If changelog already exists for this branch:** Append new section with date header rather than overwriting.

## Format Guidelines

**Good changelog entries:**
- ✅ "Added JWT token validation to auth middleware - tokens now expire after 24h instead of never"
- ✅ "Fixed null pointer crash in user lookup when email not provided - now returns 400 error instead of 500"
- ✅ "Refactored payment processing from single 800-line file into 4 focused modules"

**Bad changelog entries:**
- ❌ "Improved authentication" (vague, no before/after)
- ❌ "Fixed bug" (what bug? what symptom?)
- ❌ "Updated code" (what code? why?)
- ❌ "Made changes to file X" (what changes?)

**Key rule:** Every change entry must answer:
1. What was the before state?
2. What is the after state?
3. What specifically changed?

## Integration

**Called by:**
- `superpowers:finishing-a-development-branch` (Step 1.5)
- `superpowers:systematic-debugging` (Phase 4, Step 6)

**Input needed:**
- Branch name
- Base branch reference
- Understanding of what was implemented/fixed

**Output:**
- Changelog file saved to specs folder
- Changelog committed to branch