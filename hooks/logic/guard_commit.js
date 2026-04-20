// .claude/hooks/guard_commit.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../');
const FLAG_FILE = path.join(REPO_ROOT, '.claude/.last_test_failed');

async function main() {
    let data;
    try {
        const input = fs.readFileSync(0, 'utf8');
        data = JSON.parse(input);
    } catch (e) {
        process.exit(0);
    }

    const toolInput = data.tool_input || data.hookSpecificInput?.toolInput || {};
    const command = toolInput.command || '';

    // Only care about git commit commands
    if (!/\bgit\s+commit\b/.test(command)) {
        process.exit(0);
    }

    // Check if tests failed on the last run
    if (fs.existsSync(FLAG_FILE)) {
        console.error('🚫 git commit blocked — tests failed on last run.');
        console.error('   Fix all failures, then retry.\n');
        process.exit(2);
    }

    process.exit(0);
}

main();
