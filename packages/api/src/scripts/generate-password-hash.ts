import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script helper para generar hash de contraseña
 * 
 * Uso: pnpm generate:password-hash "mi-password"
 * O: node dist/scripts/generate-password-hash.js "mi-password"
 */
async function generatePasswordHash() {
  try {
    const password = process.argv[2];
    
    if (!password) {
      console.error('❌ Error: Password is required');
      console.log('\nUsage: pnpm generate:password-hash <password>');
      console.log('Example: pnpm generate:password-hash "123456789"');
      process.exit(1);
    }

    if (password.length < 8) {
      console.warn('⚠️  Warning: Password is less than 8 characters. Consider using a stronger password.');
    }

    const hash = await bcrypt.hash(password, 10);
    
    console.log('\n✅ Password hash generated successfully!\n');
    console.log('📋 Hash:');
    console.log(hash);
    console.log('\n💡 Copy this hash and use it in MongoDB Atlas when creating the user.\n');
    console.log('📝 Example user document for MongoDB Atlas:');
    console.log(JSON.stringify({
      email: "user@example.com",
      name: "User Name",
      email_verified: true,
      password: hash
    }, null, 2));
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating password hash:', error);
    process.exit(1);
  }
}

generatePasswordHash();

