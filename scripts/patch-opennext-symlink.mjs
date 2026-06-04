import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir, results = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.git') continue;
      walk(full, results);
    } else if (entry.name === 'copyTracedFiles.js') {
      results.push(full);
    }
  }
  return results;
}

const targets = walk(path.join(root, 'node_modules'));
if (targets.length === 0) {
  console.error('copyTracedFiles.js not found under node_modules');
  process.exit(1);
}

const oldBlock = `        if (symlink) {
            try {
                symlinkSync(symlink, to);
            }
            catch (e) {
                if (e.code !== "EEXIST") {
                    throw e;
                }
            }
        }`;

const newBlock = `        if (symlink) {
            try {
                symlinkSync(symlink, to);
            }
            catch (e) {
                if (e.code === "EPERM" || e.code === "ENOTSUP") {
                    const resolved = path.resolve(path.dirname(from), symlink);
                    cpSync(resolved, to, { recursive: true });
                } else if (e.code !== "EEXIST") {
                    throw e;
                }
            }
        }`;

let patched = 0;
for (const file of targets) {
  const content = readFileSync(file, 'utf8');
  if (content.includes('e.code === "EPERM"')) {
    patched += 1;
    continue;
  }
  if (!content.includes(oldBlock)) {
    console.warn('Skip (pattern mismatch):', file);
    continue;
  }
  writeFileSync(file, content.replace(oldBlock, newBlock));
  patched += 1;
  console.log('Patched', file);
}

const oldCopyFn = `export function copyFileAndMakeOwnerWritable(src, dest) {
    copyFileSync(src, dest);
    // Ensure the copied file is writable (add owner write permission)
    const stats = statSync(dest);`;

const newCopyFn = `export function copyFileAndMakeOwnerWritable(src, dest) {
    try {
        copyFileSync(src, dest);
    }
    catch (e) {
        if (e.code === "EPERM" || e.code === "EACCES" || e.code === "ENOTSUP") {
            mkdirSync(path.dirname(dest), { recursive: true });
            const srcStat = statSync(src);
            if (srcStat.isDirectory()) {
                cpSync(src, dest, { recursive: true });
            }
            else {
                cpSync(src, dest);
            }
        }
        else {
            throw e;
        }
    }
    // Ensure the copied file is writable (add owner write permission)
    const stats = statSync(dest);`;

let copyPatched = 0;
for (const file of targets) {
  let content = readFileSync(file, 'utf8');
  if (content.includes('e.code === "EPERM" || e.code === "EACCES" || e.code === "ENOTSUP"')) {
    copyPatched += 1;
    continue;
  }
  if (!content.includes(oldCopyFn)) {
    console.warn('Skip copyFile patch (pattern mismatch):', file);
    continue;
  }
  content = content.replace(oldCopyFn, newCopyFn);
  writeFileSync(file, content);
  copyPatched += 1;
  console.log('Patched copyFile EPERM fallback in', file);
}

if (!patched && !copyPatched) {
  console.error('No files patched');
  process.exit(1);
}

console.log(`Patched ${patched} symlink + ${copyPatched} copyFile handler(s) in copyTracedFiles.js`);

const nextUtilsCandidates = [
  path.join(root, 'node_modules', 'next', 'dist', 'build', 'utils.js'),
  path.join(root, 'node_modules', 'next', 'dist', 'esm', 'build', 'utils.js'),
];

const nextOld = `                if (symlink) {
                    try {
                        await _fs.promises.symlink(symlink, fileOutputPath);
                    } catch (e) {
                        if (e.code !== 'EEXIST') {
                            throw e;
                        }
                    }
                } else {
                    await _fs.promises.copyFile(tracedFilePath, fileOutputPath);
                }`;

const nextNew = `                if (symlink) {
                    try {
                        await _fs.promises.symlink(symlink, fileOutputPath);
                    } catch (e) {
                        if (e.code === 'EPERM' || e.code === 'ENOTSUP') {
                            const resolved = _path.default.resolve(_path.default.dirname(tracedFilePath), symlink);
                            await _fs.promises.cp(resolved, fileOutputPath, { recursive: true });
                        } else if (e.code !== 'EEXIST') {
                            throw e;
                        }
                    }
                } else {
                    await _fs.promises.copyFile(tracedFilePath, fileOutputPath);
                }`;

const nextOldEsm = nextOld.replace(/_fs\.promises/g, 'fs.promises').replace(/_path\.default/g, 'path');

const nextNewEsm = nextNew.replace(/_fs\.promises/g, 'fs.promises').replace(/_path\.default/g, 'path');

let nextPatched = 0;
for (const file of nextUtilsCandidates) {
  try {
    let content = readFileSync(file, 'utf8');
    const isEsm = file.includes(`${path.sep}esm${path.sep}`);
    const oldBlock = isEsm ? nextOldEsm : nextOld;
    const newBlock = isEsm ? nextNewEsm : nextNew;

    if (content.includes("e.code === 'EPERM' || e.code === 'ENOTSUP'")) {
      nextPatched += 1;
      continue;
    }
    if (!content.includes(oldBlock)) {
      console.warn('Skip Next utils patch (pattern mismatch):', file);
      continue;
    }
    writeFileSync(file, content.replace(oldBlock, newBlock));
    nextPatched += 1;
    console.log('Patched Next standalone symlink fallback in', file);
  } catch {
    // file may not exist
  }
}

if (nextPatched === 0) {
  console.warn('Next utils.js symlink patch not applied');
}
