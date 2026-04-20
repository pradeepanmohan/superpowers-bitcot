# LSP Troubleshooting Reference

## Issue: `ENABLE_LSP_TOOL` Not Working

**Symptom**: LSP doesn't activate even after setting the env var.

**Fix**: Ensure it's set in both your shell profile AND `~/.claude/settings.json`:

```json
{
  "env": {
    "ENABLE_LSP_TOOL": "1"
  }
}
```

Restart Claude Code completely after editing `settings.json`.

---

## Issue: `Executable not found in $PATH`

**Symptom**: `/plugin` shows an error like `LSP for typescript failed — Executable not found`.

**Fix**: Install the language server binary and verify it's on PATH:

```bash
# For vtsls
npm install -g @vtsls/language-server typescript
which vtsls  # Must return a path

# For typescript-language-server
npm install -g typescript-language-server typescript
which typescript-language-server  # Must return a path
```

If `which` returns nothing, your global npm bin directory is not on PATH.

---

## Issue: Plugin Installed but Showing `disabled`

**Symptom**: `claude plugin list` shows the plugin with `Status: disabled`.

**Fix**:
```bash
claude plugin enable typescript-lsp@claude-plugins-official
# or
claude plugin enable vtsls@claude-code-lsps
```

---

## Issue: `No LSP server available for file type: .ts`

**Symptom**: LSP tool responds with this message when working on TypeScript files.

**Checklist**:
1. Is `ENABLE_LSP_TOOL=1` set? → `echo $ENABLE_LSP_TOOL`
2. Is the plugin installed? → `claude plugin list`
3. Is the plugin enabled? → Check `~/.claude/settings.json` `enabledPlugins`
4. Is the binary installed? → `which vtsls` or `which typescript-language-server`
5. Did you restart Claude Code after installing?

---

## Issue: Windows — `LSP for vtsls failed`

**Symptom**: On Windows, the plugin fails even after correct installation.

**Fix**: Edit the `.lsp.json` files to use the `.cmd` wrapper:

Files to edit:
- `C:\Users\<user>\.claude\plugins\marketplaces\claude-code-lsps\vtsls\.lsp.json`
- `C:\Users\<user>\.claude\plugins\cache\claude-code-lsps\vtsls\1.0.0\.lsp.json`

Change `"command": "vtsls"` to `"command": "vtsls.cmd"` in both files.

---

## Verifying LSP is Working

Inside Claude Code, ask:
> "Go to the definition of [some function in your project]"

If LSP is working, Claude will return the exact file path and line number in ~50ms.
If it falls back to `grep`, it will take 5–30 seconds and may return multiple matches.
