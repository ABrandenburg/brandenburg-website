#!/usr/bin/env node

/**
 * Sync all environment variables from .env.local to Vercel
 * 
 * Usage: node scripts/sync-env-to-vercel.js [environment]
 * 
 * Environment options:
 * - production (default)
 * - preview
 * - development
 * 
 * Example: node scripts/sync-env-to-vercel.js production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ENV_FILE = path.join(__dirname, '..', '.env.local');
const ENVIRONMENTS = ['production', 'preview', 'development'];

// Get environment from command line args or default to production
const targetEnv = process.argv[2] || 'production';

if (!ENVIRONMENTS.includes(targetEnv)) {
    console.error(`❌ Invalid environment: ${targetEnv}`);
    console.error(`   Valid options: ${ENVIRONMENTS.join(', ')}`);
    process.exit(1);
}

// Check if .env.local exists
if (!fs.existsSync(ENV_FILE)) {
    console.error(`❌ .env.local file not found at: ${ENV_FILE}`);
    process.exit(1);
}

// Check if vercel CLI is installed
try {
    execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
    console.error('❌ Vercel CLI is not installed.');
    console.error('   Install it with: npm i -g vercel');
    process.exit(1);
}

// Read and parse .env.local
console.log(`📖 Reading .env.local...`);
const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
const envVars = {};

envContent.split('\n').forEach((line) => {
    line = line.trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
        return;
    }
    
    // Parse KEY=VALUE format
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        
        envVars[key] = value;
    }
});

const varCount = Object.keys(envVars).length;
console.log(`✅ Found ${varCount} environment variables\n`);

if (varCount === 0) {
    console.log('⚠️  No environment variables found in .env.local');
    process.exit(0);
}

// Confirm before proceeding
console.log(`🚀 Ready to sync ${varCount} variables to Vercel (${targetEnv} environment)`);
console.log(`\nVariables to sync:`);
Object.keys(envVars).forEach((key, index) => {
    console.log(`   ${index + 1}. ${key}`);
});

console.log(`\n⚠️  This will add/update variables in your Vercel project.`);
console.log(`   Existing variables with the same name will be updated.\n`);

// Sync each variable
console.log(`\n📤 Syncing variables to Vercel...\n`);
console.log(`⚠️  Note: You may be prompted to confirm each variable addition.\n`);

let successCount = 0;
let failCount = 0;
let skippedCount = 0;

for (const [key, value] of Object.entries(envVars)) {
    process.stdout.write(`   ${key}... `);
    
    try {
        // Check if variable already exists
        try {
            const checkCommand = `vercel env ls ${targetEnv} 2>/dev/null | grep -q "^${key}$"`;
            execSync(checkCommand, { stdio: 'ignore' });
            
            // Variable exists, ask if we should update
            // For now, we'll skip existing variables to avoid overwriting
            // You can manually update them if needed
            console.log('⏭️  (exists, skipping - use "vercel env rm" then re-run to update)');
            skippedCount++;
            continue;
        } catch (checkError) {
            // Variable doesn't exist, proceed to add it
        }
        
        // Write value to a temp file to handle special characters
        const tempFile = path.join(__dirname, '..', `.env.temp.${key}`);
        fs.writeFileSync(tempFile, value, 'utf-8');
        
        // Use the temp file as input for vercel env add
        // Vercel CLI will read from stdin if piped
        const command = `cat "${tempFile}" | vercel env add ${key} ${targetEnv}`;
        
        try {
            execSync(command, { 
                stdio: 'inherit', // Show Vercel's prompts
                encoding: 'utf-8'
            });
            console.log('✅');
            successCount++;
        } catch (addError) {
            // If it failed, it might be because of user cancellation or other issues
            console.log('❌');
            failCount++;
        } finally {
            // Clean up temp file
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
        }
    } catch (error) {
        console.log('❌');
        failCount++;
    }
}

// Summary
console.log(`\n✨ Sync complete!`);
console.log(`   ✅ Success: ${successCount}`);
if (failCount > 0) {
    console.log(`   ❌ Failed: ${failCount}`);
}
console.log(`\n💡 Tip: Run this script for each environment:`);
console.log(`   - Production: node scripts/sync-env-to-vercel.js production`);
console.log(`   - Preview: node scripts/sync-env-to-vercel.js preview`);
console.log(`   - Development: node scripts/sync-env-to-vercel.js development`);
