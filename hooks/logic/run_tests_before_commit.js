// .claude/hooks/run_tests_before_commit.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, spawnSync } from 'node:child_process';

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

    // Find changed files from the transcript/logs
    // Actually, in Claude Code, the Stop hook input doesn't always have a transcript path
    // Let's use git status as a more reliable way to find modified files in the last turn
    // or use the transcript_path if provided.
    const transcriptPath = data.transcript_path || '';
    let changedFiles = [];

    if (transcriptPath && fs.existsSync(transcriptPath)) {
        try {
            const transcript = fs.readFileSync(transcriptPath, 'utf8');
            const lines = transcript.split('\n');
            for (const line of lines) {
                if (!line.trim()) continue;
                const entry = JSON.parse(line);
                if (entry.type === 'tool_use' && ['Write', 'Edit', 'MultiEdit'].includes(entry.name)) {
                    const fp = entry.input?.file_path || '';
                    if (fp.endsWith('.ts') && !fp.endsWith('.spec.ts')) {
                        changedFiles.push(path.resolve(REPO_ROOT, fp));
                    }
                }
            }
        } catch (e) {
            // Fallback to git status if transcript parsing fails
        }
    }

    // Fallback: Check staged/unstaged changes if no files found in transcript
    if (changedFiles.length === 0) {
        try {
            const status = execSync('git status --porcelain', { cwd: REPO_ROOT, encoding: 'utf8' });
            changedFiles = status.split('\n')
                .filter(line => line.match(/^[MARCU? ]+[^\s]+\.ts$/))
                .map(line => line.slice(3).trim())
                .filter(fp => !fp.endsWith('.spec.ts'))
                .map(fp => path.resolve(REPO_ROOT, fp));
        } catch (e) {
            // ignore
        }
    }

    changedFiles = [...new Set(changedFiles)];

    if (changedFiles.length === 0) process.exit(0);

    console.error(`\n🧪 Running NestJS tests for ${changedFiles.length} changed file(s)...`);

    const args = ['run', 'test', '--', '--findRelatedTests', ...changedFiles, '--passWithNoTests', '--forceExit', '--no-coverage'];
    
    const result = spawnSync('npm', args, {
        cwd: REPO_ROOT,
        stdio: 'inherit',
        encoding: 'utf8'
    });

    if (result.status !== 0) {
        console.error('\n❌ Tests FAILED — commit blocked\n');
        console.error('Fix the failing tests before committing.');

        if (!fs.existsSync(path.dirname(FLAG_FILE))) {
            fs.mkdirSync(path.dirname(FLAG_FILE), { recursive: true });
        }
        fs.writeFileSync(FLAG_FILE, '1');
        process.exit(2);
    }

    // Tests passed — clear the flag
    if (fs.existsSync(FLAG_FILE)) {
        fs.unlinkSync(FLAG_FILE);
    }

    console.error('✅ All tests passed.\n');
    process.exit(0);
}

main();
