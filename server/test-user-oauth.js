import 'dotenv/config';

console.log('🔍 USER GOOGLE OAUTH CONFIGURATION CHECKER');
console.log('==========================================\n');

const clientId = process.env.GOOGLE_CLIENT_ID;
const serverUrl = process.env.SERVER_URL || 'http://localhost:4000';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log('Current Configuration:');
console.log(`📍 Server URL: ${serverUrl}`);
console.log(`🖥️  Frontend URL: ${frontendUrl}`);
console.log(`🔑 Client ID: ${clientId}`);
console.log('');

console.log('🎯 REQUIRED REDIRECT URI FOR GOOGLE CLOUD CONSOLE:');
console.log('Copy this EXACT URL to your Google Cloud Console:');
console.log('');
console.log('📋 User OAuth Callback:');
console.log(`   ${serverUrl}/api/user/auth/google/callback`);
console.log('');

console.log('📋 STEPS TO FIX USER GOOGLE LOGIN:');
console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
console.log(`2. Find OAuth Client: ${clientId}`);
console.log('3. Click "Edit" (pencil icon)');
console.log('4. In "Authorized redirect URIs" section, add:');
console.log(`   ${serverUrl}/api/user/auth/google/callback`);
console.log('5. Save and wait 2-3 minutes');
console.log('');

console.log('🧪 TEST URLS:');
console.log(`User OAuth:  ${serverUrl}/api/user/auth/google`);
console.log(`Frontend:    ${frontendUrl}`);
console.log('');

console.log('✅ After updating Google Cloud Console:');
console.log('1. Go to your frontend application');
console.log('2. Click "Sign in with Google"');
console.log('3. Should work without redirect_uri_mismatch error!');
