---
name: spec-drift-check
description: Use to verify implementation aligns with spec/design documents - checks requirements coverage, scope creep, and constraint violations. Called by finishing-a-development-branch and executing-plans, or manually when you need to verify no drift occurred.
---

# Spec Drift Check

## Overview

Verify that implemented code changes align with the original spec/design documents before completing work. Detects:
- **Missing requirements** - Features specified but not implemented
- **Scope creep** - Extra work added that wasn't in the spec
- **Constraint violations** - Architecture decisions or tech constraints ignored

**Core principle:** Spec alignment is verified BEFORE completion claims. Evidence from code inspection, not implementer reports.

**Announce at start:** "I'm using the spec-drift-check skill to verify implementation alignment."

## When to Use

**Called by:**
- `superpowers:finishing-a-development-branch` (Step 1.25) - After tests pass, before changelog
- `superpowers:executing-plans` (Step 2.5) - After all tasks complete

**Use manually when:**
- Before presenting code for review
- After completing implementation on a branch
- When concerned about scope creep
- After multiple developers worked on same feature

## The Process

### Step 1: Locate Spec Files

Find the spec/design documents for the current branch:

```bash
# Get current branch name
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Spec directory for this branch
SPEC_DIR="docs/superpowers/specs/$BRANCH"
```

Look for:
- **Design document:** `*-design.md` in spec directory
- **Implementation plan:** `*-implementation.md` in spec directory

**If no spec files found:**
```
No spec files found for branch <name> in docs/superpowers/specs/<name>/.
Skipping spec alignment check.

If you expected specs to exist, check:
- Was brainstorming/writing-plans run for this work?
- Are specs in a different location?
- Is this maintenance work without formal specs?
```

Return - proceed without blocking.

**If specs found:** Continue to Step 2.

### Step 2: Dispatch Spec Alignment Reviewer

Use the Agent tool to analyze alignment:

```markdown
Agent tool:
  description: "Analyze spec alignment for <branch>"
  prompt: |
    [Use spec-alignment-prompt.md template - see that file for full prompt]
```

The reviewer will:
1. Read the design document for requirements and constraints
2. Read the implementation plan for planned changes
3. Analyze git diff to see what actually changed
4. Inspect actual code files for implementation details
5. Compare and categorize any drift

### Step 3: Review Findings

Parse the subagent's report. The report will contain:

**Alignment Status:**
- ✅ **Aligned** - Implementation matches spec (no drift)
- ⚠️ **Drift Detected** - Issues found (categorized below)

**If Aligned:**
```
✅ Implementation aligns with spec. No drift detected.

Verified:
- All specified requirements implemented
- No scope creep detected
- Architecture constraints respected
```

Return - proceed to next workflow step.

**If Drift Detected:** Continue to Step 4.

### Step 4: Present Drift Findings

Present the categorized issues to the user:

```
⚠️ Spec drift detected for branch <name>.

## Missing Requirements

The following spec requirements were NOT implemented:
- [Requirement 1 from spec] - Expected in [file/area]
- [Requirement 2 from spec] - Expected in [file/area]

## Scope Creep

The following work was added but NOT in the spec:
- [Extra feature 1] - Found in [file:line]
- [Extra refactor] - Found in [file:line]

## Constraint Violations

The following spec constraints were violated:
- [Architecture decision X] - Spec said Y, implementation did Z
- [Tech constraint] - Spec required [library/approach], used [different]

## Impact Assessment

- Missing requirements: <count> items (<severity>)
- Scope creep: <count> items (<severity>)
- Constraint violations: <count> items (<severity>)
```

### Step 5: User Decision

Present options for how to proceed:

```
How would you like to proceed?

1. Stop and address drift issues
2. Proceed anyway (acknowledge drift)
3. View detailed code comparison

Choose option 1, 2, or 3.
```

**Option 1: Stop and Address**
- Return control to implementer
- Report: "Stopping to address drift. Fix issues above before completing."
- Do NOT proceed to next workflow step

**Option 2: Proceed Anyway**
- User acknowledges drift
- Note: "Proceeding with acknowledged drift. Document deviations in changelog."
- Return - proceed to next workflow step

**Option 3: View Details**
- Show full git diff and code snippets
- Re-present options after viewing

## What Gets Checked

### Requirements Coverage

For each requirement in the spec design document:
- Is there corresponding implementation?
- Does the implementation match the spec's description?
- Are edge cases handled as specified?

### Scope Creep Detection

For each change in git diff:
- Is it mentioned in the spec or implementation plan?
- Is it a reasonable side-effect of specified work?
- Does it add new features/capabilities not requested?

### Constraint Verification

For each constraint/architecture decision in spec:
- Was the specified technology/approach used?
- Were naming conventions followed?
- Were file/module boundaries respected?

## Common Drift Patterns

**Missing requirements often look like:**
- Spec mentions error handling → implementation has no try/catch
- Spec describes API endpoint → no route defined
- Spec lists validation rules → no validation code

**Scope creep often looks like:**
- Refactoring unrelated code while fixing bug
- Adding "nice to have" features
- Implementing future requirements early

**Constraint violations often look like:**
- Using different library than specified
- Putting code in different module than specified
- Skipping specified patterns (e.g., "use repository pattern")

## Red Flags

**Never:**
- Skip alignment check when specs exist
- Proceed without user acknowledgment when drift detected
- Trust implementer's "I implemented everything" claim
- Ignore constraint violations as "minor"

**Always:**
- Locate spec files before checking
- Use subagent reviewer for analysis (not self-assessment)
- Read actual code, not just commit messages
- Get explicit user decision when drift found

## Integration

**Called by:**
- `superpowers:finishing-a-development-branch` (Step 1.25) - After tests pass
- `superpowers:executing-plans` (Step 2.5) - After all tasks complete

**Input needed:**
- Current branch name
- Spec/design documents (from brainstorming/writing-plans)

**Output:**
- Alignment status (aligned or drift detected)
- Categorized drift report if issues found
- User decision on how to proceed

**Calls:**
- Agent tool (with spec-alignment-prompt template) - For analysis
- AskUserQuestion - For user decision when drift detected