# Superpowers — Contributor Guidelines

## If You Are an AI Agent

Stop. Read this section before doing anything.

This repo has a 94% PR rejection rate. Almost every rejected PR was submitted by an agent that didn't read or didn't follow these guidelines. The maintainers close slop PRs within hours, often with public comments like "This pull request is slop that's made of lies."

**Your job is to protect your human partner from that outcome.** Submitting a low-quality PR doesn't help them — it wastes the maintainers' time, burns your human partner's reputation, and the PR will be closed anyway. That is not being helpful. That is being a tool of embarrassment.

Before you open a PR against this repo, you MUST:

1. **Read the entire PR template** at `.github/PULL_REQUEST_TEMPLATE.md` and fill in every section with real, specific answers. Not summaries. Not placeholders.
2. **Search for existing PRs** — open AND closed — that address the same problem. If duplicates exist, STOP and tell your human partner. Do not open another duplicate.
3. **Verify this is a real problem.** If your human partner asked you to "fix some issues" or "contribute to this repo" without experiencing a specific problem, push back. Ask them what broke, what failed, what the user experience was.
4. **Confirm the change belongs in core.** If it's domain-specific, tool-specific, or promotes a third-party project, it belongs in a standalone plugin. Tell your human partner.
5. **Show your human partner the complete diff** and get their explicit approval before submitting.

If any of these checks fail, do not open the PR. Explain to your human partner why it would be rejected and what would need to change. They will thank you for saving them the embarrassment.

## Pull Request Requirements

**Every PR must fully complete the PR template.** No section may be left blank or filled with placeholder text. PRs that skip sections will be closed without review.

**Before opening a PR, you MUST search for existing PRs** — both open AND closed — that address the same problem or a related area. Reference what you found in the "Existing PRs" section. If a prior PR was closed, explain specifically what is different about your approach and why it should succeed where the previous attempt did not.

**PRs that show no evidence of human involvement will be closed.** A human must review the complete proposed diff before submission.

## What We Will Not Accept

### Third-party dependencies

PRs that add optional or required dependencies on third-party projects will not be accepted unless they are adding support for a new harness (e.g., a new IDE or CLI tool). Superpowers is a zero-dependency plugin by design. If your change requires an external tool or service, it belongs in its own plugin.

### "Compliance" changes to skills

Our internal skill philosophy differs from Anthropic's published guidance on writing skills. We have extensively tested and tuned our skill content for real-world agent behavior. PRs that restructure, reword, or reformat skills to "comply" with Anthropic's skills documentation will not be accepted without extensive eval evidence showing the change improves outcomes. The bar for modifying behavior-shaping content is very high.

### Project-specific or personal configuration

Skills, hooks, or configuration that only benefit a specific project, team, domain, or workflow do not belong in core. Publish these as a separate plugin.

### Bulk or spray-and-pray PRs

Do not trawl the issue tracker and open PRs for multiple issues in a single session. Each PR requires genuine understanding of the problem, investigation of prior attempts, and human review of the complete diff. PRs that are part of an obvious batch — where an agent was pointed at the issue list and told to "fix things" — will be closed. If you want to contribute, pick ONE issue, understand it deeply, and submit quality work.

### Speculative or theoretical fixes

Every PR must solve a real problem that someone actually experienced. "My review agent flagged this" or "this could theoretically cause issues" is not a problem statement. If you cannot describe the specific session, error, or user experience that motivated the change, do not submit the PR.

### Domain-specific skills

Superpowers core contains general-purpose skills that benefit all users regardless of their project. Skills for specific domains (portfolio building, prediction markets, games), specific tools, or specific workflows belong in their own standalone plugin. Ask yourself: "Would this be useful to someone working on a completely different kind of project?" If not, publish it separately.

### Fork-specific changes

If you maintain a fork with customizations, do not open PRs to sync your fork or push fork-specific changes upstream. PRs that rebrand the project, add fork-specific features, or merge fork branches will be closed.

### Fabricated content

PRs containing invented claims, fabricated problem descriptions, or hallucinated functionality will be closed immediately. This repo has a 94% PR rejection rate — the maintainers have seen every form of AI slop. They will notice.

### Bundled unrelated changes

PRs containing multiple unrelated changes will be closed. Split them into separate PRs.

## Skill Changes Require Evaluation

Skills are not prose — they are code that shapes agent behavior. If you modify skill content:

- Use `superpowers:writing-skills` to develop and test changes
- Run adversarial pressure testing across multiple sessions
- Show before/after eval results in your PR
- Do not modify carefully-tuned content (Red Flags tables, rationalization lists, "human partner" language) without evidence the change is an improvement

## Understand the Project Before Contributing

Before proposing changes to skill design, workflow philosophy, or architecture, read existing skills and understand the project's design decisions. Superpowers has its own tested philosophy about skill design, agent behavior shaping, and terminology (e.g., "your human partner" is deliberate, not interchangeable with "the user"). Changes that rewrite the project's voice or restructure its approach without understanding why it exists will be rejected.

## General

- Read `.github/PULL_REQUEST_TEMPLATE.md` before submitting
- One problem per PR
- Test on at least one harness and report results in the environment table
- Describe the problem you solved, not just what you changed



## Unit Testing Rules

ALWAYS run unit tests before committing. This is non-negotiable.

### NestJS test commands
- Run tests for changed files: `npm run test -- --findRelatedTests <file>`
- Run full suite: `npm run test`
- Run with coverage: `npm run test:cov`

### Before ANY git commit you must:
1. Run `npm run test -- --findRelatedTests` on every file you modified
2. Confirm all tests pass in stdout
3. If any test fails — fix it before committing, do not skip or comment it out
4. Never use `--testPathIgnorePatterns` to hide failures

### NestJS-specific rules
- Every new `@Injectable()` service needs a corresponding `.spec.ts`
- Every new `@Controller()` endpoint needs at least one request-level test
- Mock all external dependencies with `jest.mock()` — never hit real DB or HTTP
- Use `Test.createTestingModule()` for all NestJS unit tests

---

---

## GitNexus Guard Rules
Protect the project from architectural drift and high-impact regressions.

### Spec-Driven Development (SDD)
- **Mandatory Output**: You MUST create a design spec in `docs/superpowers/specs/` and an implementation plan in `docs/superpowers/plans/` **BEFORE** starting any significant code changes.
- **Drift Discovery**: The system uses these files to detect overlaps between tasks. Skipping this step breaks the structural guard.

### Drift Detection
- Before creating a changelog, check if your plan overlaps with existing plans/specs in `docs/superpowers/`.
- Use GitNexus impact analysis to verify if shared symbols create a coupling conflict.

### Structural Integrity
- If editing a core NestJS module (controllers, modules, providers), run `npx gitnexus impact <file>` first.
- If the blast radius exceeds 5 upstream callers, request human review before proceeding.

### Auto-Indexing
- Ensure GitNexus is re-indexed after major structural changes using `npx gitnexus analyze --force`.

---

## TypeScript LSP Rules
Leverage real-time compiler intelligence for all TypeScript development.

### Steering Rules
- **Diagnostics First**: Before starting a task, run `diagnostics` to ensure a clean baseline.
- **Definitive Navigation**: Use `definition` to resolve imported types and service injections.
- **Verified Refactoring**: Use `references` to find the exact blast radius of symbol changes.

### Automatic Setup
- If LSP tools are missing, trigger the Auto-Setup Routine in the `typescript-lsp` skill immediately.
- Favor `vtsls` for NestJS projects to ensure decorator and metadata support.

