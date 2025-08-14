import * as vscode from "vscode";

const snippets = [
  "// TODO: optimize this function",
  "console.log('debug info');",
  "function helper(param) { return param * 2; }",
  "const data = fetch('/api/data');",
  "let total = 0;",
  "const sum = (a, b) => a + b;",
  "class TempClass {\n  constructor() {}\n}",
  "try {\n  // risky code\n} catch (e) {\n  console.error(e);\n}",
  "// FIXME: workaround for legacy browser",
  "import fs from 'fs';",
  "/* random filler */",
  "const timestamp = Date.now();",
  "if (!Array.isArray(items)) return;",
  "const config = { mode: 'dev' };",
  "const user = { name: 'guest', id: 0 };",
  "let counter = 1;",
  "while (counter < 10) counter++;",
  "setTimeout(() => console.log('done'), 1000);",
  "const regex = /[a-z]+/gi;",
  "const PI = Math.PI;",
  "for (let i = 0; i < 5; i++) console.log(i);",
  "function noop() {}",
  "const isValid = (x) => x != null;",
  "const uuid = crypto.randomUUID();",
  "async function fetchData() {\n  const res = await fetch('/api');\n}",
  "const result = await someAsyncCall();",
  "let cache = new Map();",
  "const arr = [1, 2, 3].map(x => x * 2);",
  "// HACK: skip step if missing props",
  "const env = process.env.NODE_ENV;",
  "function delay(ms) { return new Promise(r => setTimeout(r, ms)); }",
  "const version = '1.0.0';",
  "function logError(err) {\n  console.error('[ERR]', err);\n}",
  "document.querySelector('#app').innerHTML = 'Hello';",
  "const path = require('path');",
  "let flag = false;",
  "const clone = obj => JSON.parse(JSON.stringify(obj));",
  "module.exports = { start };",
  "import { readFileSync } from 'fs';",
  "const userAgent = navigator.userAgent;",
  "function once(fn) {\n  let called = false;\n  return (...args) => {\n    if (!called) {\n      called = true;\n      fn(...args);\n    }\n  };\n}",
  "const logger = msg => console.log(`[LOG] ${msg}`);",
  "const defaultValue = value ?? 'default';",
  "// DEBUG: temporary log",
  "window.addEventListener('load', () => console.log('loaded'));",
  "function getRandomInt(max) { return Math.floor(Math.random() * max); }",
  "const headers = new Headers({ 'Content-Type': 'application/json' });",
  "import axios from 'axios';",
  "function sumAll(...nums) {\n  return nums.reduce((a, b) => a + b, 0);\n}",
  "const set = new Set();",
  "function parseJSON(str) {\n  try { return JSON.parse(str); } catch { return null; }\n}",
  "const token = localStorage.getItem('token');",
  "export default function init() { console.log('init'); }",
  "// NOTE: deprecated method below",
  "Object.keys(obj).forEach(key => console.log(key));",
  "const noopAsync = async () => {};",
  "if (typeof window !== 'undefined') { console.log('browser'); }",
  "const status = isActive ? 'ON' : 'OFF';",
  "function debounce(fn, delay) {\n  let t;\n  return (...args) => {\n    clearTimeout(t);\n    t = setTimeout(() => fn(...args), delay);\n  };\n}",
  "let disconnected = false;",
  "fetch('/ping').then(r => r.text()).then(console.log);",
];

async function insertRandomSnippet(editor) {
  const random = snippets[Math.floor(Math.random() * snippets.length)];
  const lastLine = editor.document.lineCount - 1;
  const lastLineLength = editor.document.lineAt(lastLine).text.length;
  const position = new vscode.Position(lastLine, lastLineLength);
  await editor.edit((editBuilder) => {
    editBuilder.insert(position, `\n${random}`);
  });
}

export { insertRandomSnippet };
