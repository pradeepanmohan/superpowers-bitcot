# Installing the Bitcot Superpowers Plugin

This document provides installation instructions for Bitcot's customized version of the Superpowers development workflow skills.

## Prerequisites

- Claude Code installed and authenticated
- Git configured with access to GitHub

## Installation

### Add the Marketplace

First, register the Bitcot marketplace:

```bash
/plugin marketplace add pradeepanmohan/superpowers-bitcot
```

### Install the Plugin

Install the plugin from the marketplace:

```bash
/plugin install superpowers-bitcot@bitcot-skills-marketplace
```

After installation, skills will be available with the `superpowers-bitcot:` namespace:
- `/superpowers-bitcot:brainstorming`
- `/superpowers-bitcot:write-plan`
- `/superpowers-bitcot:execute-plan`
- `/superpowers-bitcot:test-driven-development`

### Project-Level Installation (For Teams)

To share the plugin with your team via version control, install at project scope:

```bash
/plugin install superpowers-bitcot@bitcot-skills-marketplace --scope project
```

This writes to `.claude/settings.json`, so everyone cloning the repo gets the plugin automatically when they trust the project folder.

## Updating

To update to the latest version:

```bash
/plugin update superpowers-bitcot
```

## Version Scheme

Versions follow the `X.Y.Z-bitcot.N` format:
- `X.Y.Z` — Upstream Superpowers version (tracks original repo)
- `N` — Bitcot revision number (increments with custom changes)

Example: `5.0.7-bitcot.1` means "upstream 5.0.7 + Bitcot revision 1"

## Verification

After installation, verify by checking available skills:

```bash
/help
```

Look for skills prefixed with `superpowers-bitcot:`.

## Troubleshooting

### Marketplace not found

Ensure the repository is public and accessible. Run:
```bash
/plugin marketplace list
```

### Plugin not loading

Validate the plugin configuration:
```bash
/plugin validate .
```

### Skills not appearing

Reload plugins after changes:
```bash
/reload-plugins
```

## For Client Projects

To configure a client project to auto-prompt installation, add to the client project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "bitcot-skills-marketplace": {
      "source": {
        "source": "github",
        "repo": "pradeepanmohan/superpowers-bitcot"
      }
    }
  },
  "enabledPlugins": {
    "superpowers-bitcot@bitcot-skills-marketplace": true
  }
}
```

This configuration ensures clients are prompted to install when they trust the project folder.