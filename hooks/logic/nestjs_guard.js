// .claude/hooks/nestjs_guard.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../');

async function main() {
    let data;
    try {
        const input = fs.readFileSync(0, 'utf8');
        data = JSON.parse(input);
    } catch (e) {
        process.exit(0);
    }

    const toolInput = data.tool_input || data.hookSpecificInput?.toolInput || {};
    const target = toolInput.file_path || '';

    if (!target) process.exit(0);

    const guarded = ['.module.ts', '.service.ts', '.controller.ts', '.guard.ts'];
    if (!guarded.some(g => target.endsWith(g))) process.exit(0);

    const symbol = path.basename(target).replace('.ts', '');
    try {
        const result = execSync(
            `npx gitnexus impact --target "${symbol}" --direction upstream`,
            { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 10000 }
        );
        if (result) {
            const impact = JSON.parse(result);
            const risk = impact.riskLevel || 'low';
            const callers = impact.directCallers || [];

            if (risk === 'high' || callers.length > 5) {
                console.error(`⚠️  High-impact NestJS file: ${target}`);
                console.error(`   Risk: ${risk} | Upstream callers: ${callers.length}`);
                console.error(`   Callers: ${callers.slice(0, 5).join(', ')}`);
                console.error('   Proceed only if plan covers all affected modules.');
                // exit 2 to BLOCK, or exit 0 to WARN and allow
                process.exit(0);
            }
        }
    } catch (e) {
        // Ignore errors
    }
    process.exit(0);
}

main();
