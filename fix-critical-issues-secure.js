import fs from 'fs/promises';
import path from 'path';

const fixes = [];

async function checkEnvironmentVariables() {
    console.log('🔍 Checking environment variables...');
    
    try {
        const envPath = path.join('server', '.env');
        const envContent = await fs.readFile(envPath, 'utf8');
        
        // Check if all required variables are present
        const requiredVars = [
            'JWT_SECRET',
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET',
            'FRONTEND_URL',
            'ADMIN_URL',
            'SERVER_URL',
            'SERVER_PORT',
            'MONGODB_URI',
            'GEMINI_API_KEY',
            'STRIPE_SECRET_KEY'
        ];
        
        const missingVars = [];
        const placeholderVars = [];
        
        for (const varName of requiredVars) {
            if (!envContent.includes(`${varName}=`)) {
                missingVars.push(varName);
            } else if (envContent.includes(`${varName}=your_`) || envContent.includes(`${varName}=sk_test_your_`)) {
                placeholderVars.push(varName);
            }
        }
        
        if (missingVars.length > 0) {
            fixes.push(`❌ Missing environment variables: ${missingVars.join(', ')}`);
            fixes.push('   Please add these variables to server/.env file');
        }
        
        if (placeholderVars.length > 0) {
            fixes.push(`⚠️  Placeholder values found for: ${placeholderVars.join(', ')}`);
            fixes.push('   Please update these with actual values in server/.env file');
        }
        
        if (missingVars.length === 0 && placeholderVars.length === 0) {
            fixes.push('✅ All environment variables are properly configured');
        }
        
    } catch (error) {
        fixes.push(`❌ Failed to check environment variables: ${error.message}`);
        fixes.push('   Please ensure server/.env file exists');
    }
}

async function fixDotenvLoading() {
    console.log('🔄 Checking dotenv loading in files...');
    
    const filesToCheck = [
        'server/server.js',
        'server/controllers/geminiController.js',
        'server/controllers/orderController.js',
        'server/config/db.js'
    ];
    
    for (const filePath of filesToCheck) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            
            if (!content.includes('dotenv.config()') && !content.includes('dotenv/config')) {
                fixes.push(`⚠️  ${filePath} may need dotenv configuration`);
            } else {
                fixes.push(`✅ ${filePath} has proper dotenv loading`);
            }
            
        } catch (error) {
            fixes.push(`❌ Failed to check ${filePath}: ${error.message}`);
        }
    }
}

async function checkPackageJsonIssues() {
    console.log('📦 Checking package.json files...');
    
    const directories = ['server', 'client', 'admin'];
    
    for (const dir of directories) {
        try {
            const packagePath = path.join(dir, 'package.json');
            const packageContent = await fs.readFile(packagePath, 'utf8');
            const packageJson = JSON.parse(packageContent);
            
            // Check server configuration
            if (dir === 'server') {
                if (packageJson.type !== 'module') {
                    fixes.push(`⚠️  ${dir}/package.json should have "type": "module"`);
                } else {
                    fixes.push(`✅ ${dir}/package.json has correct module type`);
                }
                
                if (!packageJson.scripts || !packageJson.scripts.start) {
                    fixes.push(`⚠️  ${dir}/package.json missing start script`);
                } else {
                    fixes.push(`✅ ${dir}/package.json has start script`);
                }
            }
            
        } catch (error) {
            fixes.push(`❌ Failed to check package.json in ${dir}: ${error.message}`);
        }
    }
}

async function checkAdminPortConfiguration() {
    console.log('🔌 Checking admin port configuration...');
    
    try {
        const viteConfigPath = path.join('admin', 'vite.config.js');
        const content = await fs.readFile(viteConfigPath, 'utf8');
        
        if (content.includes('port: 5175')) {
            fixes.push('✅ Admin port correctly configured to 5175');
        } else if (content.includes('port: 5174')) {
            fixes.push('⚠️  Admin port should be changed from 5174 to 5175');
        } else {
            fixes.push('⚠️  Admin port configuration not found');
        }
        
    } catch (error) {
        fixes.push(`❌ Failed to check admin port: ${error.message}`);
    }
}

async function checkDependencies() {
    console.log('📦 Checking dependencies...');
    
    const directories = ['server', 'client', 'admin'];
    
    for (const dir of directories) {
        try {
            await fs.access(path.join(dir, 'node_modules'));
            fixes.push(`✅ Dependencies installed in ${dir}`);
        } catch {
            fixes.push(`⚠️  Dependencies need to be installed in ${dir}`);
            fixes.push(`   Run: cd ${dir} && npm install`);
        }
    }
}

// Main execution
async function main() {
    console.log('🔍 EATZONE SECURITY & CONFIGURATION CHECKER');
    console.log('==========================================\n');
    
    try {
        await checkEnvironmentVariables();
        await fixDotenvLoading();
        await checkPackageJsonIssues();
        await checkAdminPortConfiguration();
        await checkDependencies();
        
        console.log('\n📋 CHECK RESULTS');
        console.log('================');
        
        fixes.forEach(fix => console.log(fix));
        
        console.log('\n📝 SECURITY RECOMMENDATIONS:');
        console.log('1. Never commit .env files to version control');
        console.log('2. Use strong, unique values for JWT_SECRET');
        console.log('3. Use production credentials for production deployment');
        console.log('4. Regularly rotate API keys and secrets');
        console.log('5. Monitor logs for any exposed sensitive information');
        
        console.log('\n🚀 TO START THE APPLICATION:');
        console.log('1. Ensure all environment variables are properly set');
        console.log('2. Install dependencies: npm install in each directory');
        console.log('3. Start services:');
        console.log('   - Server: cd server && npm start');
        console.log('   - Client: cd client && npm run dev');
        console.log('   - Admin:  cd admin && npm run dev');
        
    } catch (error) {
        console.error('❌ Error during checks:', error.message);
    }
}

main();
