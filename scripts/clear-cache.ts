#!/usr/bin/env bun
// @ts-expect-error - Bun module
import { $ } from 'bun';

console.log('🧹 Clearing all Next.js caches...');

// Clear .next directory
await $`rm -rf .next`.quiet();
await $`rm -rf node_modules/.cache`.quiet();

console.log('✅ Caches cleared!');
