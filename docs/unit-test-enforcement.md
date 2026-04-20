# Automated Unit Test Enforcement

Superpowers ensures that unit testing is a non-negotiable part of the development workflow. This is achieved through a two-layered enforcement system that blocks commits if tests are failing or missing.

## How it Works

The enforcement system consists of two gates:

### Gate 1: The Stop Hook (`run_tests_before_commit.js`)
- **Trigger**: Automatically runs after every task an agent completes.
- **Action**: 
  1. Identifies all `.ts` files modified during the task.
  2. Runs `npm run test -- --findRelatedTests <files>`.
  3. If any test fails, it prints a detailed failure report and blocks the agent from finishing the task.
  4. It sets an ephemeral failure flag in `.claude/.last_test_failed`.

### Gate 2: The Commit Guard (`guard_commit.js`)
- **Trigger**: Runs before any `git commit` command (via `PreToolUse` hook).
- **Action**: 
  1. Checks for the `.claude/.last_test_failed` flag.
  2. If the flag exists (meaning the last test run failed), it blocks the commit command.
  3. This prevents "sneaking in" a commit without fixing failing tests first.

---

## Behavioral Rules (CLAUDE.md)

The system is reinforced by rules in `CLAUDE.md` that instruct the agent on:
- **Mandatory Testing**: Always run tests before committing.
- **NestJS Specifics**: Every `@Injectable` needs a `.spec.ts`, and every `@Controller` needs a request-level test.
- **Tooling**: Use `--findRelatedTests` for fast, targeted execution.

---

## Maintenance

- **Passing Tests**: When tests pass, the `.last_test_failed` flag is automatically removed.
- **Manual Override**: If you need to manually clear the flag (e.g., after fixing tests outside of the agent context), you can delete `.claude/.last_test_failed`.
- **Gitignore**: The flag file `.claude/.last_test_failed` should be added to your `.gitignore` to prevent it from being committed.

```bash
# .gitignore update
.claude/.last_test_failed
```
