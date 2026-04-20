// .claude/hooks/plan_drift_check.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../');
const PLANS_DIR = path.join(REPO_ROOT, 'docs/superpowers/plans/');
const SPECS_DIR = path.join(REPO_ROOT, 'docs/superpowers/specs/');

const NESTJS_PATTERNS = [
    /\b([A-Z][a-zA-Z]+Module)\b/g,
    /\b([A-Z][a-zA-Z]+Service)\b/g,
    /\b([A-Z][a-zA-Z]+Controller)\b/g,
    /\b([A-Z][a-zA-Z]+Guard)\b/g,
    /\b([A-Z][a-zA-Z]+Interceptor)\b/g,
    /\b([A-Z][a-zA-Z]+Pipe)\b/g,
    /\b([A-Z][a-zA-Z]+Repository)\b/g,
    /\b([A-Z][a-zA-Z]+Gateway)\b/g,
    /`([a-z\-]+\.module\.ts)`/g,
    /`([a-z\-]+\.service\.ts)`/g,
    /`([a-z\-]+\.controller\.ts)`/g,
    /\/([a-z\-]+)\//g
];

function extractNestJSTokens(filePath) {
    if (!fs.existsSync(filePath)) return new Set();
    const content = fs.readFileSync(filePath, 'utf8');
    const tokens = new Set();
    for (const pattern of NESTJS_PATTERNS) {
        let match;
        // Reset lastIndex for global regex
        pattern.lastIndex = 0;
        while ((match = pattern.exec(content)) !== null) {
            tokens.add(match[1] || match[0]);
        }
    }
    return tokens;
}

function getAllPlans() {
    const files = [];
    if (fs.existsSync(PLANS_DIR)) {
        files.push(...fs.readdirSync(PLANS_DIR).filter(f => f.endsWith('.md')).map(f => path.join(PLANS_DIR, f)));
    }
    if (fs.existsSync(SPECS_DIR)) {
        files.push(...fs.readdirSync(SPECS_DIR).filter(f => f.endsWith('.md')).map(f => path.join(SPECS_DIR, f)));
    }
    return files;
}

const planFiles = getAllPlans();
if (planFiles.length < 2) process.exit(0);

const currentPlan = planFiles.reduce((a, b) => fs.statSync(a).mtime > fs.statSync(b).mtime ? a : b);
const currentTokens = extractNestJSTokens(currentPlan);

const overlaps = [];
for (const planFile of planFiles) {
    if (planFile === currentPlan) continue;
    const tokens = extractNestJSTokens(planFile);
    const shared = [...currentTokens].filter(t => tokens.has(t));
    if (shared.length > 0) {
        overlaps.push({ planA: currentPlan, planB: planFile, shared });
    }
}

if (overlaps.length === 0) process.exit(0);

console.error('\n⚠️  NESTJS PLAN DRIFT DETECTED\n');

for (const { planA, planB, shared } of overlaps) {
    console.error(`  Overlap: ${path.basename(planA)} ↔ ${path.basename(planB)}`);
    console.error(`  Shared NestJS symbols: ${shared.slice(0, 6).join(', ')}`);

    const services = shared.filter(t => t.endsWith('Service'));
    const modules = shared.filter(t => t.endsWith('Module'));

    for (const symbol of [...services.slice(0, 2), ...modules.slice(0, 2)]) {
        try {
            const result = execSync(
                `npx gitnexus impact --target "${symbol}" --direction upstream`,
                { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 12000 }
            );
            if (result) {
                const impact = JSON.parse(result);
                const risk = impact.riskLevel || 'unknown';
                const callers = impact.directCallers || [];
                const flows = impact.affectedExecutionFlows || [];
                console.error(`\n  📦 ${symbol}`);
                console.error(`     Risk level   : ${risk}`);
                console.error(`     Direct callers: ${callers.length}`);
                console.error(`     Affected flows: ${flows.length}`);
                if (callers.length > 0) {
                    console.error(`     Callers: ${callers.slice(0, 4).join(', ')}`);
                }
            }
        } catch (e) {
            console.error(`  ⚠️  GitNexus unavailable for ${symbol}: run 'npx gitnexus analyze .'`);
        }
    }
}

console.error('\n🛑 Resolve plan conflicts before changelog is generated.');
process.exit(2);
