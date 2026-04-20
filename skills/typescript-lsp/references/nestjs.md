# NestJS LSP Reference

## Why NestJS Needs Special Attention

NestJS relies on TypeScript decorator metadata for its dependency injection system.
Without `emitDecoratorMetadata: true`, the language server may not resolve injected
services correctly.

## Required tsconfig.json Settings

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

The NestJS CLI generates this by default. If you've customized your tsconfig,
ensure at minimum `experimentalDecorators` and `emitDecoratorMetadata` are true.

## Path Aliases

If your project uses path aliases (e.g., `@app/`, `@modules/`), configure them in tsconfig:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/*"],
      "@modules/*": ["src/modules/*"],
      "@common/*": ["src/common/*"]
    }
  }
}
```

The LSP server picks these up automatically — no additional config needed.

## Recommended Plugin for NestJS: vtsls

`vtsls` is the language server VS Code uses internally and handles NestJS decorators
more reliably than `typescript-language-server`:

```bash
npm install -g @vtsls/language-server typescript
claude plugin install vtsls@claude-code-lsps
```

## NestJS-Specific LSP Capabilities

### Dependency Injection Navigation
- Jump to the class decorated with `@Injectable()` from any injection point
- Find all modules that import a given module
- See all services injected into a controller

### Decorator-Aware Type Checking
- Real-time errors in `class-validator` decorators (`@IsString()`, `@IsEmail()`, etc.)
- Type checking inside `@Body()`, `@Param()`, `@Query()` parameter decorators
- Validation of `@Module({ imports: [], providers: [] })` array types
