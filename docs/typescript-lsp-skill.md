# TypeScript LSP Superpower: Architectural Overview

The **TypeScript LSP Skill** is a project-agnostic capability that integrates Language Server Protocol (LSP) intelligence directly into the Claude Code workflow. It enables high-speed, type-aware code navigation and validation that surpasses traditional text-based search (grep).

## Execution Trigger & Lifecycle

The Auto-Setup routine is **self-healing** and executes at the exact moment it's needed:

1.  **Initial Task Scan**: When an agent begins a task involving `.ts` files, it checks for the `typescript-lsp` skill.
2.  **Configuration Check**: The agent proactively verifies the existence of `ENABLE_LSP_TOOL` and the `vtsls` binary.
3.  **Automatic Repair**: If any component is missing, the agent executes the **Auto-Setup Routine** defined in the skill *immediately* before starting any code edits.
4.  **Instant Intelligence**: For the remainder of that task and all future sessions, the agent has full access to semantic tools.

This ensures that the environment is always optimized without the user needing to manually run setup scripts every time.

### 1. The Intelligence Layer (The Server)
The system relies on a background process that parses the entire TypeScript Abstract Syntax Tree (AST).
- **vtsls**: Optimized for handling complex TypeScript features like decorators and monorepo path aliases.
- **Diagnostics**: The server continuously monitors files for type errors, which the skill then retrieves to block broken commits.

### 2. The Integration Layer (The Plugin)
Claude Code connects to the language server via a dedicated plugin.
- **LSP Tooling**: By setting `ENABLE_LSP_TOOL=1`, Claude Code activates its internal LSP client.
- **Tool Mapping**: Natural language requests like "Go to definition" are converted into JSON-RPC calls sent to the language server.

### 3. The Instruction Layer (The Skill)
This is the `typescript-lsp` skill itself. It provides the "steering" for the agent:
- **When to invoke**: Proactively before commits, during refactoring, or when navigating unfamiliar code.
- **How to resolve**: Provides troubleshooting paths for environment mismatches (Windows vs. Linux), permission issues, or missing binaries.

---

## Why it's "Reusable Across Projects"

Unlike local scripts that target specific file paths, this skill is designed for **Global Portability**:
- **User-Level Storage**: When installed via `claude skill install`, it lives in your global `~/.claude/` config.
- **Dynamic Configuration**: It detects the project type (NestJS vs. React) by inspecting `tsconfig.json` at runtime, applying the correct architectural guidance automatically.
- **Standardized Tools**: It leverages official marketplace plugins, ensuring consistency across different team environments.

---

## NestJS Specialization

The skill is uniquely tuned for the NestJS ecosystem:
- **Decorator Awareness**: It understands that `@Injectable()` classes are semantic nodes in a Dependency Injection tree.
- **DI Navigation**: You can ask to "find all users of this service," and it will resolve exactly where the service is injected into Controllers or other Services, ignoring unrelated string matches.
- **DTO Validation**: Real-time checking of `class-validator` metadata in your request payloads.

---

## Usage Summary

| Action | Result |
|---|---|
| **`diagnostics`** | Absolute certainty about type safety. |
| **`hover`** | Instant access to function signatures and JSDoc. |
| **`definition`** | Precision navigation across modules and re-exports. |
| **`references`** | Reliable assessment of the "blast radius" for any change. |

For detailed setup steps, refer to [SKILL.md](file:///home/bitcot/Project/superpowers/skills/typescript-lsp/SKILL.md).
