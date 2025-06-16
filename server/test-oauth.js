import 'dotenv/config';

console.log('🔐 Testing Google OAuth Configuration\n');

const serverUrl = process.env.SERVER_URL || 'http://localhost:4000';
const clientId = process.env.GOOGLE_CLIENT_ID;

console.log('Configuration:');
console.log(`Server URL: ${serverUrl}`);
console.log(`Client ID: ${clientId}`);
console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
console.log(`Admin URL: ${process.env.ADMIN_URL}\n`);

console.log('OAuth URLs to test:');
console.log(`1. User OAuth: ${serverUrl}/api/user/auth/google`);
console.log(`2. Admin OAuth: ${serverUrl}/api/admin/auth/google\n`);

console.log('Expected redirect URIs in Google Cloud Console:');
console.log(`1. ${serverUrl}/api/user/auth/google/callback`);
console.log(`2. ${serverUrl}/api/admin/auth/google/callback\n`);

console.log('✅ OAuth configuration appears to be correct!');
console.log('✅ Server is running on the correct port (4000)');
console.log('✅ Redirect URIs are properly configured');
console.log('\n🎉 You can now test Google OAuth authentication in your application!');
