# GitNexus Semantic Guard

The GitNexus Semantic Guard is an intelligent verification layer for Superpowers that prevents architectural drift and conflicting changes by combining text-based plan analysis with deep code-structural awareness.

## Overview

Traditional drift detection relies on simple text comparisons between plan files. The GitNexus Semantic Guard upgrades this by using an Abstract Syntax Tree (AST) graph of your repository to understand the true "blast radius" of any proposed change.

### Key Features

- **Plan Overlap Detection**: Automatically flags when multiple implementation plans touch the same code symbols (Services, Modules, Controllers).
- **Structural Guard**: Warns you before editing high-impact files that have many upstream dependencies.
- **NestJS Native**: Specifically tuned to understand NestJS decorators (`@Injectable`, `@Module`, `@Controller`) and constructor-based dependency injection.
- **Auto-Indexing**: Keeps the structural graph fresh by re-analyzing the repository after every commit or merge.

---

## Architecture

The system operates in three distinct phases of the agentic workflow:

### 1. The Post-Task Check (`Stop` Hook)
When an agent finishes a task, the `plan_drift_check.js` script runs.
1. **Textual Scan**: Identifies code symbols (e.g., `AuthService`, `user.module.ts`) mentioned in the current plan and compares them with other plans in `docs/superpowers/plans/`.
2. **Structural Validation**: If a textual overlap is found, it queries GitNexus to see if the shared symbols have a high degree of technical coupling.
3. **Alerting**: If the conflict is confirmed, the system blocks the creation of the changelog and warns the user.

### 2. The Pre-Edit Guard (`PreToolUse` Hook)
Before an agent modifies a file, the `nestjs_guard.js` script runs.
- It calculates the **Impact Analysis** (upstream callers) of the file being edited.
- If the file is a core NestJS component with high risk/coupling, it warns the user to ensure the plan covers all affected modules.

### 3. The Sync Hook (`PostToolUse` Hook)
After a `git commit` or `git merge`, the system triggers an asynchronous re-index:
```bash
npx gitnexus analyze --force
```
This ensures that subsequent tasks are analyzed against the most recent state of the codebase.

---

## Installation & Setup

### GitNexus CLI
The system relies on the `gitnexus` CLI for structural analysis.

1. **Index the repository**:
   ```bash
   npx gitnexus analyze . --embeddings
   ```

2. **Verify indexing status**:
   ```bash
   npx gitnexus status
   ```

### Hooks Configuration
The hooks are registered in `hooks/hooks.json` and managed by the Superpowers plugin system. They call JavaScript scripts located in `hooks/logic/` via bash wrappers in `hooks/`.

---

## Troubleshooting

- **"Index unavailable"**: Ensure you have run `npx gitnexus analyze .`.
- **Permission Errors**: The check scripts require Node.js and standard shell tools (`grep`, `ls`). Ensure these are available in your environment.
- **Python Missing**: The system has been migrated to pure Node.js/JavaScript; Python is no longer required.
