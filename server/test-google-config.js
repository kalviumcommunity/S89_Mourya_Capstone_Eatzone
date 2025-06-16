import 'dotenv/config';

console.log('🔍 GOOGLE OAUTH CONFIGURATION CHECKER');
console.log('=====================================\n');

const clientId = process.env.GOOGLE_CLIENT_ID;
const serverUrl = process.env.SERVER_URL || 'http://localhost:4000';

console.log('Current Configuration:');
console.log(`📍 Server URL: ${serverUrl}`);
console.log(`🔑 Client ID: ${clientId}`);
console.log('');

console.log('🎯 REQUIRED REDIRECT URIs FOR GOOGLE CLOUD CONSOLE:');
console.log('Copy these EXACT URLs to your Google Cloud Console:');
console.log('');
console.log('1️⃣ User OAuth Callback:');
console.log(`   ${serverUrl}/api/user/auth/google/callback`);
console.log('');
console.log('2️⃣ Admin OAuth Callback:');
console.log(`   ${serverUrl}/api/admin/auth/google/callback`);
console.log('');

console.log('📋 STEPS TO FIX:');
console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
console.log(`2. Find OAuth Client: ${clientId}`);
console.log('3. Click "Edit"');
console.log('4. Add the above redirect URIs to "Authorized redirect URIs"');
console.log('5. Save and wait 2-3 minutes');
console.log('');

console.log('🧪 TEST URLS:');
console.log(`User OAuth:  ${serverUrl}/api/user/auth/google`);
console.log(`Admin OAuth: ${serverUrl}/api/admin/auth/google`);
console.log('');

console.log('✅ After updating Google Cloud Console, test these URLs!');
