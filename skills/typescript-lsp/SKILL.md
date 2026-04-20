---
name: typescript-lsp
description: >
  Sets up and configures the TypeScript/JavaScript Language Server Protocol (LSP) plugin
  automatically. Use this whenever working on TypeScript/NestJS projects to gain
  IDE-level intelligence (diagnostics, hover, definition, references).
---

# TypeScript LSP Skill (Automated)

This skill provides real-time compiler intelligence. **If you detect the LSP is not configured, you must perform the Auto-Setup below before continuing.**

---

## 🛠 Automated Setup Routine

If the LSP tools/plugins are missing, execute these steps in order:

### 1. Check & Set Environment
```bash
if [ -z "$ENABLE_LSP_TOOL" ]; then
  export ENABLE_LSP_TOOL=1
  echo 'export ENABLE_LSP_TOOL=1' >> ~/.bashrc
  echo 'export ENABLE_LSP_TOOL=1' >> ~/.zshrc
fi
```

### 2. Check & Install Binaries
```bash
if ! command -v vtsls &> /dev/null; then
  npm install -g @vtsls/language-server typescript
fi
```

### 3. Check & Install Plugin
```bash
if ! claude plugin list | grep -q "vtsls"; then
  claude plugin marketplace add Piebald-AI/claude-code-lsps
  claude plugin install vtsls@claude-code-lsps
  claude plugin enable vtsls@claude-code-lsps
fi
```

### 4. Direct Settings Update
```bash
node -e "
const fs = require('fs');
const p = process.env.HOME + '/.claude/settings.json';
const s = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p)) : {};
s.env = { ...s.env, ENABLE_LSP_TOOL: '1' };
s.enabledPlugins = { ...s.enabledPlugins, 'vtsls@claude-code-lsps': true };
fs.writeFileSync(p, JSON.stringify(s, null, 2));
"
```

---

## 🚀 Capabilities

Once setup, use these tools/scripts:

### Diagnostics (Error checking)
`npx ts-node -P tsconfig.scripts.json scripts/typescript-lsp.ts diagnostics <file>` or `lsp-diagnostics`

### Definition (Navigation)
`npx ts-node -P tsconfig.scripts.json scripts/typescript-lsp.ts definition <file> <line> <char>` or `lsp-definition`

### Hover (Type Info)
`npx ts-node -P tsconfig.scripts.json scripts/typescript-lsp.ts hover <file> <line> <char>`

---

## 📝 Required Workflows

1. **Auto-Verify**: Before finishing any task, run `diagnostics` on all edited `.ts` files.
2. **Safe Navigation**: Use `definition` to understand imported NestJS services.
3. **Refactoring**: Use `references` to find the impact of changing a method signature.

> [!IMPORTANT]
> If you just performed the Auto-Setup, you may need to restart your current session or use the local `scripts/typescript-lsp.ts` bridge as a fallback until the plugin initializes.

For NestJS-specific deep dives, see [references/nestjs.md](file:///home/bitcot/Project/superpowers/skills/typescript-lsp/references/nestjs.md).
