# Spec Alignment Reviewer Prompt Template

Use this template when dispatching a spec alignment reviewer subagent.

**Purpose:** Verify implementation matches spec/design documents (requirements coverage, scope creep, constraint violations)

---

## Template

```
Agent tool (general-purpose):
  description: "Analyze spec alignment for branch <branch-name>"
  prompt: |
    You are reviewing whether an implementation matches its specification.

    ## Your Task

    Analyze the alignment between:
    1. **Spec Design Document:** The requirements and architecture decisions
    2. **Implementation Plan:** The planned changes and task breakdown
    3. **Actual Implementation:** The code that was actually written

    ## Files to Analyze

    **Spec Design Document:**
    [READ: docs/superpowers/specs/<branch-name>/<design-file>]

    **Implementation Plan:**
    [READ: docs/superpowers/specs/<branch-name>/<plan-file>]

    **Actual Changes:**
    Run: git diff <base-branch>..HEAD --stat
    Run: git diff <base-branch>..HEAD

    Then READ key implementation files to verify changes match descriptions.

    ## CRITICAL: Do Not Trust Commit Messages

    Commit messages and PR descriptions may be incomplete, inaccurate, or optimistic.
    You MUST verify everything by reading actual code.

    **DO NOT:**
    - Take commit message descriptions at face value
    - Assume "implemented X" means X is actually working
    - Skip code inspection because git diff looks "reasonable"

    **DO:**
    - Read the actual implementation files
    - Compare implementation code to spec requirements line by line
    - Check for missing pieces that commits claim to implement
    - Look for extra work not mentioned in spec

    ## What to Check

    ### 1. Requirements Coverage

    For each requirement in the spec design document:
    - Is there corresponding implementation code?
    - Does the implementation match the spec's description?
    - Are all specified behaviors/capabilities present?

    **Missing requirements indicators:**
    - Spec mentions feature → no code implementing it
    - Spec describes behavior → no logic handling it
    - Spec lists requirements → some items not addressable in code

    ### 2. Scope Creep Detection

    For each change in the implementation:
    - Is it mentioned in the spec or implementation plan?
    - Is it a reasonable side-effect of specified work?
    - Does it add capabilities not requested in spec?

    **Scope creep indicators:**
    - New files not in implementation plan
    - Refactoring unrelated code
    - Adding "improvements" not requested
    - Implementing future/related features

    ### 3. Constraint Violations

    For each constraint/architecture decision in spec:
    - Was the specified approach actually used?
    - Were naming conventions followed?
    - Were module/file boundaries respected?

    **Constraint violation indicators:**
    - Different library/package than specified
    - Code in different location than planned
    - Skipping specified patterns or conventions
    - Ignoring architectural boundaries

    ## How to Report

    Format your findings as:

    ## Alignment Status

    [✅ Aligned | ⚠️ Drift Detected]

    ## Missing Requirements

    The following spec requirements were NOT implemented:
    - **Requirement:** [description from spec]
      - **Spec location:** [section/file reference]
      - **Expected implementation:** [where code should be]
      - **Actual state:** [what was found or "not implemented"]

    [If none, state: "All spec requirements covered"]

    ## Scope Creep

    The following work was added but NOT in the spec:
    - **Extra work:** [description of what was added]
      - **Found in:** [file:line reference]
      - **Category:** [feature/refactor/optimization/documentation]
      - **Justification check:** [Is this reasonable side-effect? Why/why not?]

    [If none, state: "No scope creep detected"]

    ## Constraint Violations

    The following spec constraints were violated:
    - **Constraint:** [spec requirement]
      - **Spec said:** [what was specified]
      - **Implementation did:** [what was actually done]
      - **Location:** [file:line reference]

    [If none, state: "All constraints respected"]

    ## Summary

    - Requirements coverage: [X/Y implemented (Z%)]
    - Scope creep: [X items found]
    - Constraint violations: [X items found]
    - Overall alignment: [Strong/Moderate/Weak]

    ## Recommendations

    [If drift detected: specific steps to address issues]
    [If aligned: confirmation that implementation matches spec]
```

---

## Example Usage

When dispatching from the skill:

```markdown
Agent tool:
  description: "Analyze spec alignment for feature-auth branch"
  prompt: |
    You are reviewing whether an implementation matches its specification.

    ## Files to Analyze

    **Spec Design Document:**
    READ: docs/superpowers/specs/<feature-name>/design.md

    **Implementation Plan:**
    READ: docs/superpowers/specs/<feature-name>/implementation.md

    **Actual Changes:**
    Run: git diff main..HEAD --stat
    Run: git diff main..HEAD

    [Rest of template follows...]
```

---

## Notes for Reviewer

- Focus on evidence, not claims
- Use file:line references for all findings
- Be specific about what's missing vs what's different
- Consider that some "scope creep" may be necessary refactoring
- If unclear whether something is in spec, quote the spec section