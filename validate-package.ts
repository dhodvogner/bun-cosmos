#!/usr/bin/env bun

/**
 * Validation script to check the package structure
 * Run with: bun run validate-package.ts
 */

import { existsSync } from "fs";
import { join } from "path";

const requiredFiles = [
  "package.json",
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "src/index.ts",
  "src/config.ts",
  "src/types.ts",
  "src/watch-build.ts",
  "cosmos/cosmos.html",
  "cosmos/cosmos.renderer.tsx",
  "example/index.ts",
  "example/fixtures/Button.fixture.tsx",
  "test/config.test.ts",
  "test/index.test.ts",
  ".github/workflows/ci.yml",
  ".github/workflows/publish.yml",
];

const requiredDirs = [
  "src",
  "cosmos",
  "example",
  "test",
  ".github/workflows",
];

console.log("🔍 Validating package structure...\n");

let hasErrors = false;

// Check directories
console.log("Checking directories:");
for (const dir of requiredDirs) {
  const exists = existsSync(dir);
  console.log(`  ${exists ? "✅" : "❌"} ${dir}`);
  if (!exists) hasErrors = true;
}

// Check files
console.log("\nChecking files:");
for (const file of requiredFiles) {
  const exists = existsSync(file);
  console.log(`  ${exists ? "✅" : "❌"} ${file}`);
  if (!exists) hasErrors = true;
}

// Check package.json structure
console.log("\nChecking package.json structure:");
const pkg = require("./package.json");
const pkgChecks = {
  "Has name": !!pkg.name,
  "Has version": !!pkg.version,
  "Has description": !!pkg.description,
  "Has license": !!pkg.license,
  "Has exports": !!pkg.exports,
  "Has main": !!pkg.main,
  "Has types": !!pkg.types,
  "Has repository": !!pkg.repository,
  "Has keywords": Array.isArray(pkg.keywords) && pkg.keywords.length > 0,
  "Has test script": !!pkg.scripts?.test,
  "Has peerDependencies": !!pkg.peerDependencies,
};

for (const [check, passed] of Object.entries(pkgChecks)) {
  console.log(`  ${passed ? "✅" : "❌"} ${check}`);
  if (!passed) hasErrors = true;
}

// Summary
console.log("\n" + "=".repeat(50));
if (hasErrors) {
  console.log("❌ Validation failed! Please fix the issues above.");
  process.exit(1);
} else {
  console.log("✅ All checks passed! Package structure is valid.");
  process.exit(0);
}
