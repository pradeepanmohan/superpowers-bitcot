# Hierarchical CLAUDE.md Structure for NestJS Projects

## Executive Summary

Instead of a single monolithic CLAUDE.md, use **module-level CLAUDE.md files** with a **root CLAUDE.md that serves as an index**. This makes rules localized, easier to maintain, and more relevant to developers working in specific modules.

---

## Current Approach: Single Root CLAUDE.md

**Current state:**
- One `/CLAUDE.md` file at project root
- Contains all rules (global + module-specific mixed together)
- Developers must scroll through entire file to find relevant rules
- Updates to one module's rules affect the whole file

**Problems:**
- Hard to scale as project grows
- Rules get lost in noise
- Difficult to find module-specific context
- No clear responsibility boundaries

---

## Proposed: Hierarchical CLAUDE.md

**Structure:**

```
project-root/
│
├── CLAUDE.md                          # Root index (small, links to modules)
│
└── src/
    ├── auth/
    │   ├── CLAUDE.md                  # Auth module rules
    │   ├── services/
    │   ├── controllers/
    │   └── guards/
    │
    ├── payments/
    │   ├── CLAUDE.md                  # Payments module rules
    │   ├── services/
    │   └── controllers/
    │
    ├── users/
    │   ├── CLAUDE.md                  # Users module rules
    │   ├── services/
    │   └── entities/
    │
    └── common/
        ├── CLAUDE.md                  # Common utilities rules
        └── decorators/
```

---

## Why This Works Better

### 1. **Clarity & Locality**
- Rules live next to the code they govern
- Developers find rules without searching entire codebase
- Each module owns its own standards

**Example:**
```
# Developer working on auth module
src/auth/services/auth.service.ts
↓ Check for rules
src/auth/CLAUDE.md  ✓ Found! (no need to read root)
```

### 2. **Scalability**
- Adding new modules = add new CLAUDE.md
- No need to update root file for each module
- Team can work independently on modules

### 3. **Maintainability**
- Module-specific rules change independently
- Reduces merge conflicts
- Easier to review (smaller files)

### 4. **Override & Specialization**
- Global rules in root apply to all
- Module rules can override/extend for that module only
- Sub-modules can further specialize

**Example:** Root says "test coverage 70%", but Auth module says "test coverage 100%"

### 5. **Documentation & Onboarding**
- New developer joining auth team reads: `src/auth/CLAUDE.md` → immediate context
- Doesn't need to understand entire project first

---

## Root CLAUDE.md: The Index

The root CLAUDE.md becomes **small and focused** — it only contains:

1. **Global rules** (apply to all modules)
2. **Module index** (links to each module's CLAUDE.md)
3. **PR requirements** (universal standards)

### Example Root CLAUDE.md Structure

```markdown
# Project Name — Contributor Guidelines

## Global Rules (Apply Everywhere)

### If You Are an AI Agent
- Read this section before working
- Check existing PRs before submitting
- Show complete diff to human partner

### Universal PR Requirements
- Every PR needs complete PR template
- One problem per PR
- Run full test suite before submitting

---

## Module-Specific Rules

Each module has specialized guidelines. Start with the relevant module:

| Module | Purpose | Rules |
|--------|---------|-------|
| **Auth** | Authentication & sessions | [CLAUDE.md](src/auth/CLAUDE.md) |
| **Payments** | Payment processing | [CLAUDE.md](src/payments/CLAUDE.md) |
| **Users** | User management | [CLAUDE.md](src/users/CLAUDE.md) |
| **Common** | Shared utilities | [CLAUDE.md](src/common/CLAUDE.md) |

### How to Use This Structure

1. Find your module in the table above
2. Read that module's CLAUDE.md for specific rules
3. If something isn't in the module file, check back here (root)
4. Module rules take priority over root rules for conflicts

---

## Testing Rules

All modules follow these universal testing standards:
- [See "Unit Testing Rules" below]

## General Contributing Guidelines

[Rest of global content...]
```

---

## Module-Level CLAUDE.md: The Specialist

Each module CLAUDE.md contains **only** what's unique to that module:

### Example: Auth Module CLAUDE.md

```markdown
# Auth Module — Development Guidelines

**Inherits from:** [Root CLAUDE.md](../../CLAUDE.md)

## Module Purpose
Authentication, JWT tokens, session management, password hashing.

## Auth-Specific Rules

### Testing Requirements
- **Coverage:** 100% (higher than global 70%)
- **Must test:** Success paths + all failure scenarios
- **Must mock:** External auth providers (Okta, Auth0, etc.)
- Command: `npm run test -- src/auth`

### Code Standards
- All auth logic MUST be in services (never in controllers)
- Controllers only handle HTTP concerns
- Use dependency injection for all config

### Prohibited Patterns
- ❌ Never log passwords or tokens
- ❌ Never store plaintext secrets
- ❌ Never return full user objects (filter sensitive fields)

### Key Files
- `services/auth.service.ts` — Main auth logic
- `services/jwt.service.ts` — Token generation/validation
- `guards/jwt.guard.ts` — Route protection

### Common Issues
[Troubleshooting tips specific to auth module]
```

### Example: Payments Module CLAUDE.md

```markdown
# Payments Module — Development Guidelines

**Inherits from:** [Root CLAUDE.md](../../CLAUDE.md)

## Module Purpose
Payment processing, invoicing, subscription management.

## Payments-Specific Rules

### Compliance & Security
- **PCI DSS Level 1** — No credit card storage
- **Encryption:** All payment data encrypted at rest
- **Logging:** Never log full card numbers
- **Audit:** All transactions logged with timestamps

### Testing Requirements
- **Coverage:** 100%
- **Must use:** Integration tests with Stripe mock provider
- **Command:** `npm run test:payments`

### Prohibited Patterns
- ❌ Never store credit card data
- ❌ Never send payment data in logs
- ❌ Never commit provider API keys

### Key Dependencies
- `stripe@^15.0.0` — Payment provider
- `nestjs-stripe` — NestJS integration
```

---

## Rule Inheritance & Conflicts

### How Rules Combine

```
Global Rules (Root)
        ↓
    Applies to all modules
        ↓
Module Rules (Auth)
        ↓
    Overrides/extends global
        ↓
Final Rules = Global + Module-specific
```

### Conflict Resolution

**If root and module disagree, module wins.**

```
Root CLAUDE.md: "Test coverage must be 70%"
Auth CLAUDE.md: "Test coverage must be 100% for auth"
Result: Auth module requires 100%, other modules require 70%
```

---

## Implementation Steps

### Step 1: Identify Modules
```bash
ls -la src/
# Output your NestJS module folders
```

### Step 2: Create Module CLAUDE.md Template

For each module, create `src/{module}/CLAUDE.md`:

```markdown
# {Module} Module — Development Guidelines

**Inherits from:** [Root CLAUDE.md](../../CLAUDE.md)

## Module Purpose
[1-2 sentences describing what this module does]

## Module-Specific Rules

### [Rule Category 1]
- Rule 1
- Rule 2

### [Rule Category 2]
- Rule 1
- Rule 2

### Prohibited Patterns
- ❌ Pattern 1
- ❌ Pattern 2

### Key Files
- `filename.ts` — Description
```

### Step 3: Update Root CLAUDE.md

Add the module index table at top (see example above).

### Step 4: Move Rules to Modules

Extract relevant rules from root → move to module CLAUDE.md.

---

## Before & After: Example

### Before (Single File)
```
CLAUDE.md (8,000+ lines)
├── Global rules (500 lines)
├── Auth rules (1,500 lines)
├── Payments rules (2,000 lines)
├── Users rules (1,200 lines)
├── Common rules (800 lines)
└── Miscellaneous (800 lines)

Developer on Auth team: "Where's the auth password hashing rule?"
→ Scrolls through 8,000 line file... finds it at line 2,847
```

### After (Hierarchical)
```
CLAUDE.md (1,000 lines)
├── Global rules (300 lines)
└── Module index with links (700 lines)

src/auth/CLAUDE.md (500 lines)
├── Auth-specific rules only
└── Easy to scan and update

Developer on Auth team: "Where's the auth password hashing rule?"
→ Opens src/auth/CLAUDE.md
→ Finds it in 30 seconds
```

---

## Benefits Summary

| Benefit | Single File | Hierarchical |
|---------|------------|--------------|
| **File Size** | 8,000+ lines | ~1,000 root + 500/module |
| **Find Time** | 2-3 min search | 30 sec lookup |
| **Update Effort** | Risky merge conflicts | Independent per module |
| **Onboarding** | Read entire file | Read 1 module file |
| **Scaling** | Becomes unwieldy | Scales linearly |
| **Module Independence** | Rules mixed together | Clear boundaries |
| **AI Agent Navigation** | Hard to prioritize | Automated lookup |

---

## Agent Navigation Algorithm

When an AI agent works on a file, it should:

1. **Identify the module:**
   ```
   File: src/auth/services/auth.service.ts
   Module: auth
   ```

2. **Check for CLAUDE.md (closest first):**
   ```
   src/auth/CLAUDE.md ✓ Found → Read this first
   src/auth/services/CLAUDE.md (doesn't exist)
   ```

3. **Combine rules:**
   ```
   Load: src/auth/CLAUDE.md (module rules)
   Load: CLAUDE.md (global rules)
   Merge: Module rules override global rules
   ```

4. **Apply merged rules** to the work

---

## FAQ

### Q: Do I need a CLAUDE.md for every folder?
**A:** No. Create CLAUDE.md for each **NestJS module** (e.g., `@Module()` decorated folder), not every subfolder. Typical project has 4-8 modules.

### Q: What if my module has no special rules?
**A:** You can skip the CLAUDE.md for that module. Just list it in root index for completeness.

### Q: Can sub-modules have their own CLAUDE.md?
**A:** Yes. If you have `src/api/v1/` and `src/api/v2/`, each can have a CLAUDE.md that inherits from `src/api/CLAUDE.md`.

### Q: How do I update a rule that applies to all modules?
**A:** Update root CLAUDE.md. All modules inherit it automatically.

### Q: What if a module breaks the rule?
**A:** Module rules take priority. Document the override in that module's CLAUDE.md with a note explaining why.

---

## Next Steps

1. Review your NestJS module structure
2. Create CLAUDE.md for 2-3 high-priority modules
3. Extract relevant rules from root → place in modules
4. Update root CLAUDE.md with module index
5. Share updated CLAUDE.md files with team
6. Monitor and refine over time
