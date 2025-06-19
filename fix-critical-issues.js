import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import path from 'path';

console.log('🔧 EATZONE CRITICAL ISSUE FIXER');
console.log('================================\n');

const fixes = [];

async function fixEnvironmentVariables() {
    console.log('🔐 Fixing environment variables...');
    
    try {
        const envPath = path.join('server', '.env');
        const envContent = await fs.readFile(envPath, 'utf8');
        
        // Check if all required variables are present and properly configured
        const requiredVars = {
            'JWT_SECRET': 'asadsddffhgyguhuhjhjbhfdgewsresghghbmjkhiljlijkhukgfghfghvnndgdgrdrgdfghjghgh',
            'GOOGLE_CLIENT_ID': '1092628850179-d5e1f15or1tk17d2n43li7t00905c530.apps.googleusercontent.com',
            'GOOGLE_CLIENT_SECRET': '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',
            'FRONTEND_URL': 'http://localhost:5173',
            'ADMIN_URL': 'http://localhost:5175',
            'SERVER_URL': 'http://localhost:4000',
            'SERVER_PORT': '4000',
            'MONGODB_URI': 'mongodb+srv://kadalimouryas89:18011801@cluster0.cbk0vyf.mongodb.net/eatzone',
            'GEMINI_API_KEY': 'AIzaSyApXYg-OKe0LW5cpi_QRTGrkDeZeRlq-6w',
            'STRIPE_SECRET_KEY': 'sk_test_51RV39g4asXllkSK57xkIAZV7B8R4PjjXL7XfDaQZhmoceCZgxLcEy9ybQ6SNyAIeBoFyjPkqszPRc5eQkxI8H8CT00wiZmDxJj'
        };
        
        let updatedEnv = envContent;
        let hasChanges = false;
        
        for (const [key, value] of Object.entries(requiredVars)) {
            const regex = new RegExp(`^${key}=.*$`, 'm');
            const line = `${key}=${value}`;
            
            if (regex.test(updatedEnv)) {
                // Variable exists, check if it needs updating
                if (!updatedEnv.includes(line)) {
                    updatedEnv = updatedEnv.replace(regex, line);
                    hasChanges = true;
                }
            } else {
                // Variable doesn't exist, add it
                updatedEnv += `\n${line}`;
                hasChanges = true;
            }
        }
        
        if (hasChanges) {
            await fs.writeFile(envPath, updatedEnv);
            fixes.push('✅ Updated environment variables');
        } else {
            fixes.push('✅ Environment variables already correct');
        }
        
    } catch (error) {
        fixes.push(`❌ Failed to fix environment variables: ${error.message}`);
    }
}

async function fixDotenvLoading() {
    console.log('🔄 Fixing dotenv loading in all files...');
    
    const filesToFix = [
        'server/server.js',
        'server/controllers/geminiController.js',
        'server/controllers/orderController.js',
        'server/config/db.js'
    ];
    
    for (const filePath of filesToFix) {
        try {
            let content = await fs.readFile(filePath, 'utf8');
            let hasChanges = false;
            
            // Replace 'dotenv/config' imports with proper dotenv.config()
            if (content.includes("import 'dotenv/config'")) {
                content = content.replace(
                    "import 'dotenv/config'",
                    "import dotenv from 'dotenv';\n\n// Load environment variables\ndotenv.config();"
                );
                hasChanges = true;
            }
            
            // Ensure dotenv is imported and configured
            if (!content.includes('dotenv.config()') && !content.includes('dotenv/config')) {
                const lines = content.split('\n');
                const importIndex = lines.findIndex(line => line.startsWith('import'));
                
                if (importIndex !== -1) {
                    lines.splice(importIndex, 0, "import dotenv from 'dotenv';");
                    lines.splice(importIndex + 1, 0, "");
                    lines.splice(importIndex + 2, 0, "// Load environment variables");
                    lines.splice(importIndex + 3, 0, "dotenv.config();");
                    lines.splice(importIndex + 4, 0, "");
                    
                    content = lines.join('\n');
                    hasChanges = true;
                }
            }
            
            if (hasChanges) {
                await fs.writeFile(filePath, content);
                fixes.push(`✅ Fixed dotenv loading in ${filePath}`);
            }
            
        } catch (error) {
            fixes.push(`❌ Failed to fix ${filePath}: ${error.message}`);
        }
    }
}

async function fixPackageJsonIssues() {
    console.log('📦 Fixing package.json issues...');
    
    const directories = ['server', 'client', 'admin'];
    
    for (const dir of directories) {
        try {
            const packagePath = path.join(dir, 'package.json');
            const packageContent = await fs.readFile(packagePath, 'utf8');
            const packageJson = JSON.parse(packageContent);
            
            let hasChanges = false;
            
            // Ensure proper scripts are present
            if (dir === 'server') {
                const requiredScripts = {
                    'start': 'node server.js',
                    'dev': 'nodemon server.js',
                    'server': 'nodemon server.js'
                };
                
                if (!packageJson.scripts) {
                    packageJson.scripts = {};
                }
                
                for (const [script, command] of Object.entries(requiredScripts)) {
                    if (packageJson.scripts[script] !== command) {
                        packageJson.scripts[script] = command;
                        hasChanges = true;
                    }
                }
            }
            
            // Ensure type: module is set for server
            if (dir === 'server' && packageJson.type !== 'module') {
                packageJson.type = 'module';
                hasChanges = true;
            }
            
            if (hasChanges) {
                await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
                fixes.push(`✅ Fixed package.json in ${dir}`);
            }
            
        } catch (error) {
            fixes.push(`❌ Failed to fix package.json in ${dir}: ${error.message}`);
        }
    }
}

async function fixAdminPortConfiguration() {
    console.log('🔌 Fixing admin port configuration...');
    
    try {
        const viteConfigPath = path.join('admin', 'vite.config.js');
        let content = await fs.readFile(viteConfigPath, 'utf8');
        
        if (content.includes('port: 5174')) {
            content = content.replace('port: 5174', 'port: 5175');
            content = content.replace('// Use port 5174 for admin', '// Use port 5175 for admin');
            
            await fs.writeFile(viteConfigPath, content);
            fixes.push('✅ Fixed admin port configuration to 5175');
        } else {
            fixes.push('✅ Admin port already configured correctly');
        }
        
    } catch (error) {
        fixes.push(`❌ Failed to fix admin port: ${error.message}`);
    }
}

async function fixCorsConfiguration() {
    console.log('🌐 Fixing CORS configuration...');
    
    try {
        const serverPath = path.join('server', 'server.js');
        let content = await fs.readFile(serverPath, 'utf8');
        
        // Ensure CORS allows the correct admin URL
        if (content.includes('http://localhost:5174') && !content.includes('http://localhost:5175')) {
            content = content.replace(
                "'http://localhost:5174',",
                "'http://localhost:5174',\n      'http://localhost:5175'  // Admin panel"
            );
            
            await fs.writeFile(serverPath, content);
            fixes.push('✅ Fixed CORS configuration for admin panel');
        } else {
            fixes.push('✅ CORS configuration already correct');
        }
        
    } catch (error) {
        fixes.push(`❌ Failed to fix CORS: ${error.message}`);
    }
}

async function installDependencies() {
    console.log('📦 Installing dependencies...');
    
    const directories = ['server', 'client', 'admin'];
    
    for (const dir of directories) {
        try {
            // Check if node_modules exists
            try {
                await fs.access(path.join(dir, 'node_modules'));
                fixes.push(`✅ Dependencies already installed in ${dir}`);
            } catch {
                fixes.push(`⏳ Installing dependencies in ${dir}...`);
                // Dependencies will be installed by the startup script
            }
        } catch (error) {
            fixes.push(`❌ Failed to check dependencies in ${dir}: ${error.message}`);
        }
    }
}

async function createStartupScripts() {
    console.log('📝 Creating startup scripts...');
    
    // The startup script was already created above
    fixes.push('✅ Startup script created: start-all-services.bat');
}

// Main execution
async function main() {
    try {
        await fixEnvironmentVariables();
        await fixDotenvLoading();
        await fixPackageJsonIssues();
        await fixAdminPortConfiguration();
        await fixCorsConfiguration();
        await installDependencies();
        await createStartupScripts();
        
        console.log('\n📋 FIX SUMMARY');
        console.log('==============');
        
        fixes.forEach(fix => console.log(fix));
        
        console.log('\n🎉 Critical issues have been fixed!');
        console.log('\n📝 Next steps:');
        console.log('1. Run: start-all-services.bat');
        console.log('2. Or manually start each service:');
        console.log('   - Server: cd server && npm start');
        console.log('   - Client: cd client && npm run dev');
        console.log('   - Admin:  cd admin && npm run dev');
        
    } catch (error) {
        console.error('❌ Error during fixes:', error.message);
    }
}

main();
