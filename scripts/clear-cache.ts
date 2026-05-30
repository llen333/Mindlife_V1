#!/usr/bin/env bun
import { $ } from 'bun';

console.log('🧹 Clearing all Next.js caches...');

// Clear .next directory
await $`rm -rf .next`.quiet();
await $`rm -rf node_modules/.cache`.quiet();

console.log('✅ Caches cleared!');
