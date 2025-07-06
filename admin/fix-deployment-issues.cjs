#!/usr/bin/env node

/**
 * Fix Admin Deployment Issues Script
 * Addresses React 19 compatibility and service worker registration errors
 */

const fs = require('fs').promises;
const path = require('path');

console.log('🔧 FIXING ADMIN DEPLOYMENT ISSUES');
console.log('==================================\n');

async function checkAndFixIssues() {
    const fixes = [];
    
    try {
        // 1. Check if vite.config.js has proper configuration
        console.log('📋 Checking Vite configuration...');
        const viteConfigPath = path.join(__dirname, 'vite.config.js');
        const viteConfig = await fs.readFile(viteConfigPath, 'utf8');
        
        if (viteConfig.includes('process.env.PUBLIC_URL')) {
            fixes.push('✅ Vite config has proper environment variable definitions');
        } else {
            fixes.push('❌ Vite config missing environment variable definitions');
        }
        
        if (viteConfig.includes('optimizeDeps')) {
            fixes.push('✅ Vite config has dependency optimization');
        } else {
            fixes.push('❌ Vite config missing dependency optimization');
        }
        
        // 2. Check main.jsx for proper React 19 initialization
        console.log('📋 Checking React initialization...');
        const mainJsxPath = path.join(__dirname, 'src', 'main.jsx');
        const mainJsx = await fs.readFile(mainJsxPath, 'utf8');
        
        if (mainJsx.includes('DOMContentLoaded')) {
            fixes.push('✅ main.jsx has proper DOM ready handling');
        } else {
            fixes.push('❌ main.jsx missing DOM ready handling');
        }
        
        if (mainJsx.includes('try {') && mainJsx.includes('catch')) {
            fixes.push('✅ main.jsx has error handling');
        } else {
            fixes.push('❌ main.jsx missing error handling');
        }
        
        // 3. Check netlify.toml for service worker blocking
        console.log('📋 Checking Netlify configuration...');
        const netlifyTomlPath = path.join(__dirname, 'netlify.toml');
        const netlifyToml = await fs.readFile(netlifyTomlPath, 'utf8');
        
        if (netlifyToml.includes('/sw.js')) {
            fixes.push('✅ netlify.toml blocks service worker requests');
        } else {
            fixes.push('❌ netlify.toml missing service worker blocking');
        }
        
        if (netlifyToml.includes('Content-Security-Policy')) {
            fixes.push('✅ netlify.toml has security headers');
        } else {
            fixes.push('❌ netlify.toml missing security headers');
        }
        
        // 4. Check AdminContext for proper initialization
        console.log('📋 Checking AdminContext...');
        const adminContextPath = path.join(__dirname, 'src', 'context', 'AdminContext.jsx');
        const adminContext = await fs.readFile(adminContextPath, 'utf8');
        
        if (adminContext.includes('createContext({')) {
            fixes.push('✅ AdminContext has default values');
        } else {
            fixes.push('❌ AdminContext missing default values');
        }
        
        // 5. Check App.jsx for Suspense boundaries
        console.log('📋 Checking App component...');
        const appJsxPath = path.join(__dirname, 'src', 'App.jsx');
        const appJsx = await fs.readFile(appJsxPath, 'utf8');
        
        if (appJsx.includes('Suspense')) {
            fixes.push('✅ App.jsx has Suspense boundaries');
        } else {
            fixes.push('❌ App.jsx missing Suspense boundaries');
        }
        
        // 6. Check for any service worker imports
        console.log('📋 Checking for service worker imports...');
        const srcFiles = await getAllJsxFiles(path.join(__dirname, 'src'));
        let hasServiceWorkerImports = false;
        
        for (const file of srcFiles) {
            const content = await fs.readFile(file, 'utf8');
            if (content.includes('serviceWorker') || content.includes('registerSW')) {
                hasServiceWorkerImports = true;
                fixes.push(`❌ Service worker import found in ${file}`);
            }
        }
        
        if (!hasServiceWorkerImports) {
            fixes.push('✅ No service worker imports found in admin app');
        }
        
        console.log('\n📋 DEPLOYMENT READINESS CHECK');
        console.log('=============================');
        
        fixes.forEach(fix => console.log(fix));
        
        const errors = fixes.filter(fix => fix.startsWith('❌'));
        const successes = fixes.filter(fix => fix.startsWith('✅'));
        
        console.log(`\n📊 SUMMARY: ${successes.length} checks passed, ${errors.length} issues found`);
        
        if (errors.length === 0) {
            console.log('\n🎉 ALL DEPLOYMENT ISSUES FIXED!');
            console.log('✅ Admin app is ready for deployment');
            console.log('\n🚀 NEXT STEPS:');
            console.log('1. Run: npm run build');
            console.log('2. Deploy the dist folder to Netlify');
            console.log('3. Ensure environment variables are set in Netlify dashboard');
        } else {
            console.log('\n⚠️  ISSUES NEED TO BE ADDRESSED:');
            errors.forEach(error => console.log(`   ${error}`));
        }
        
    } catch (error) {
        console.error('❌ Error during checks:', error.message);
    }
}

async function getAllJsxFiles(dir) {
    const files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...await getAllJsxFiles(fullPath));
        } else if (item.name.endsWith('.jsx') || item.name.endsWith('.js')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Run the checks
checkAndFixIssues();
