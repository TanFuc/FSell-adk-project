#!/usr/bin/env node
import fs from "fs";
import path from "path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const targets = [path.join(root, "backend", "src"), path.join(root, "frontend", "src")];
const exts = new Set([".ts", ".tsx", ".js", ".jsx"]);

const isWrite = process.argv.includes("--write");
const isCheck = process.argv.includes("--check");
const tagPattern = /\b(TODO|FIXME|HACK|XXX|DEBUG)\b/i;
const consolePattern = /^\s*console\.(log|error|warn|info|debug)\(.*\);?\s*$/;

const changedFiles = [];
let removedConsoleCount = 0;
let removedTagCommentCount = 0;

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, name);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    if (exts.has(path.extname(fullPath))) {
      files.push(fullPath);
    }
  }
  return files;
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  const lines = original.split(/\r?\n/);
  const kept = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (consolePattern.test(trimmed)) {
      removedConsoleCount += 1;
      continue;
    }

    const isLineCommentTag = trimmed.startsWith("//") && tagPattern.test(trimmed);
    const isBlockCommentTag =
      trimmed.startsWith("/*") && trimmed.endsWith("*/") && tagPattern.test(trimmed);

    if (isLineCommentTag || isBlockCommentTag) {
      removedTagCommentCount += 1;
      continue;
    }

    kept.push(line);
  }

  const updated = kept.join("\n");
  if (updated !== original) {
    changedFiles.push(path.relative(root, filePath));
    if (isWrite) {
      fs.writeFileSync(filePath, updated, "utf8");
    }
  }
}

for (const target of targets) {
  for (const file of walk(target)) {
    processFile(file);
  }
}

if (changedFiles.length === 0) {
  console.log("cleanup-debug-tags: no changes");
  process.exit(0);
}

console.log(`cleanup-debug-tags: changed ${changedFiles.length} file(s)`);
console.log(`- removed console lines: ${removedConsoleCount}`);
console.log(`- removed tag comments: ${removedTagCommentCount}`);
for (const file of changedFiles.slice(0, 20)) {
  console.log(`  * ${file}`);
}

if (!isWrite) {
  console.log("Run with --write to apply changes.");
}

if (isCheck && changedFiles.length > 0) {
  process.exit(1);
}
