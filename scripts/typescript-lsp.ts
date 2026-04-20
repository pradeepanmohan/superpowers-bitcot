/**
 * TypeScript-LSP Skill Client
 * ============================================================
 * Communicates with typescript-language-server over JSON-RPC 2.0 stdio.
 *
 * Usage:
 *   npx ts-node -P tsconfig.scripts.json scripts/typescript-lsp.ts <command> <file> [line] [char]
 */

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { pathToFileURL } from 'url';

interface LspPosition { line: number; character: number; }
interface LspRange { start: LspPosition; end: LspPosition; }
interface LspDiagnostic { range: LspRange; severity?: 1 | 2 | 3 | 4; code?: string | number; message: string; source?: string; }
interface FriendlyDiagnostic { line: number; col: number; severity: 'error' | 'warning' | 'info' | 'hint'; code: string | number | undefined; message: string; }
interface PendingRequest { resolve: (val: unknown) => void; reject: (err: unknown) => void; }

let nextRequestId = 1;
const pendingRequests: Record<number, PendingRequest> = {};
const pendingDiagnostics: Record<string, LspDiagnostic[]> = {};
let dataBuffer = '';
let lsProcess: ChildProcess;

function encodeMessage(obj: unknown): string {
  const body = JSON.stringify(obj);
  return `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n${body}`;
}

function sendRequest(method: string, params: unknown): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const id = nextRequestId++;
    pendingRequests[id] = { resolve, reject };
    lsProcess.stdin!.write(encodeMessage({ jsonrpc: '2.0', id, method, params }));
  });
}

function sendNotification(method: string, params: unknown): void {
  lsProcess.stdin!.write(encodeMessage({ jsonrpc: '2.0', method, params }));
}

function handleData(chunk: Buffer): void {
  dataBuffer += chunk.toString('utf8');
  while (true) {
    const match = dataBuffer.match(/^Content-Length: (\d+)\r\n\r\n/);
    if (!match) break;
    const contentLength = parseInt(match[1], 10);
    const headerLength = match[0].length;
    const totalLength = headerLength + contentLength;
    if (dataBuffer.length < totalLength) break;
    const body = dataBuffer.slice(headerLength, totalLength);
    dataBuffer = dataBuffer.slice(totalLength);
    try {
      const msg = JSON.parse(body);
      if (msg.id !== undefined && pendingRequests[msg.id]) {
        if (msg.error) pendingRequests[msg.id].reject(msg.error);
        else pendingRequests[msg.id].resolve(msg.result);
        delete pendingRequests[msg.id];
      } else if (msg.method === 'textDocument/publishDiagnostics' && msg.params?.uri) {
        pendingDiagnostics[msg.params.uri] = msg.params.diagnostics ?? [];
      }
    } catch {}
  }
}

async function startServer(rootPath: string): Promise<void> {
  lsProcess = spawn('npx', ['typescript-language-server', '--stdio'], { shell: true, cwd: rootPath });
  lsProcess.stdout!.on('data', handleData);
  lsProcess.stderr!.on('data', () => {});
  lsProcess.on('error', (err: Error) => { process.stderr.write(`LSP process error: ${err.message}\n`); process.exit(1); });

  await sendRequest('initialize', {
    processId: process.pid,
    rootUri: pathToFileURL(rootPath).toString(),
    capabilities: {
      textDocument: {
        synchronization: { dynamicRegistration: false, didOpen: true },
        hover: { contentFormat: ['plaintext', 'markdown'] },
        references: {},
        definition: {},
        diagnostics: {},
      }
    }
  });
  sendNotification('initialized', {});
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    process.stderr.write('Usage: npx ts-node -P tsconfig.scripts.json scripts/typescript-lsp.ts <command> <file> [line] [char]\n');
    process.exit(1);
  }

  const [command, rawFile, rawLine, rawChar] = args;
  const filePath = path.isAbsolute(rawFile) ? rawFile : path.resolve(process.cwd(), rawFile);
  if (!fs.existsSync(filePath)) { process.stderr.write(`Error: File not found → ${filePath}\n`); process.exit(1); }

  const line = rawLine ? Math.max(0, parseInt(rawLine, 10) - 1) : 0;
  const character = rawChar ? Math.max(0, parseInt(rawChar, 10) - 1) : 0;
  const fileUri = pathToFileURL(filePath).toString();
  const rootPath = process.cwd();

  await startServer(rootPath);
  sendNotification('textDocument/didOpen', {
    textDocument: {
      uri: fileUri,
      languageId: filePath.endsWith('.tsx') ? 'typescriptreact' : 'typescript',
      version: 1,
      text: fs.readFileSync(filePath, 'utf8')
    }
  });

  await new Promise(r => setTimeout(r, 1000));
  let result: any;

  switch (command) {
    case 'diagnostics':
      result = (pendingDiagnostics[fileUri] || []).map(d => ({
        line: d.range.start.line + 1,
        col: d.range.start.character + 1,
        severity: d.severity === 1 ? 'error' : d.severity === 2 ? 'warning' : 'info',
        message: d.message
      }));
      break;
    case 'hover':
      result = await sendRequest('textDocument/hover', { textDocument: { uri: fileUri }, position: { line, character } });
      break;
    case 'definition':
      const def = await sendRequest('textDocument/definition', { textDocument: { uri: fileUri }, position: { line, character } });
      result = Array.isArray(def) ? def.map((l: any) => ({ filePath: new URL(l.uri).pathname, line: l.range.start.line + 1 })) : def;
      break;
    case 'references':
      const refs = await sendRequest('textDocument/references', { textDocument: { uri: fileUri }, position: { line, character }, context: { includeDeclaration: true } });
      result = Array.isArray(refs) ? refs.map((l: any) => ({ filePath: new URL(l.uri).pathname, line: l.range.start.line + 1 })) : refs;
      break;
  }

  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  lsProcess.kill();
  process.exit(0);
}

main().catch(err => { process.stderr.write(`Fatal error: ${err}\n`); process.exit(1); });
