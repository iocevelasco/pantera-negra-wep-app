/**
 * Generate VAPID Keys for Web Push Notifications
 * Uses only Node.js crypto (no external dependencies)
 * 
 * Run this script to generate VAPID keys:
 *   pnpm tsx src/scripts/generate-vapid-keys.ts
 * 
 * Or use the npm script:
 *   pnpm generate:vapid-keys
 */

import crypto from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔑 Generating VAPID keys for Web Push Notifications...\n');

// Generate ECDSA key pair (P-256 curve)
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'prime256v1',
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

// Extract public key in uncompressed format (for VAPID)
// VAPID public key is the uncompressed EC point (65 bytes: 0x04 + 32 bytes X + 32 bytes Y)
const publicKeyObj = crypto.createPublicKey(publicKey);

// Get the public key as a Buffer in uncompressed format
// We need to extract the X and Y coordinates from the DER-encoded key
const publicKeyDer = publicKeyObj.export({ type: 'spki', format: 'der' });

// Parse DER to extract the uncompressed point
// The DER structure for EC public key contains the point in the last 65 bytes
// Format: 0x04 (uncompressed) + 32 bytes X + 32 bytes Y
let uncompressedPoint: Buffer;

try {
  // Find the point in the DER structure
  // The point usually starts after the algorithm identifier
  const derBuffer = Buffer.from(publicKeyDer);
  
  // Look for the uncompressed point marker (0x04)
  let pointIndex = -1;
  for (let i = 0; i < derBuffer.length - 65; i++) {
    if (derBuffer[i] === 0x04) {
      // Check if the next 64 bytes look like valid coordinates
      pointIndex = i;
      break;
    }
  }
  
  if (pointIndex === -1) {
    // Fallback: use ECDH to get the point
    const ecdh = crypto.createECDH('prime256v1');
    const privateKeyObj = crypto.createPrivateKey(privateKey);
    const privateKeyDer = privateKeyObj.export({ type: 'pkcs8', format: 'der' });
    ecdh.setPrivateKey(Buffer.from(privateKeyDer));
    const point = ecdh.getPublicKey(null, 'uncompressed');
    uncompressedPoint = point;
  } else {
    uncompressedPoint = derBuffer.slice(pointIndex, pointIndex + 65);
  }
} catch (error) {
  // Fallback: use ECDH
  const ecdh = crypto.createECDH('prime256v1');
  const privateKeyObj = crypto.createPrivateKey(privateKey);
  const privateKeyDer = privateKeyObj.export({ type: 'pkcs8', format: 'der' });
  ecdh.setPrivateKey(Buffer.from(privateKeyDer));
  uncompressedPoint = ecdh.getPublicKey(null, 'uncompressed');
}

// Convert to base64url
const vapidPublicKey = uncompressedPoint.toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '');

// For VAPID, we use the full PEM private key
const vapidPrivateKey = privateKey;

// Get frontend URL from env or use default
let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
try {
  // Try to read from .env file if exists
  const envPath = join(process.cwd(), '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  const frontendMatch = envContent.match(/FRONTEND_URL=(.+)/);
  if (frontendMatch) {
    frontendUrl = frontendMatch[1].trim();
  }
} catch {
  // .env file doesn't exist or can't be read, use default
}

console.log('✅ VAPID keys generated successfully!\n');
console.log('Add these to your .env file:\n');
console.log('VAPID_PUBLIC_KEY=' + vapidPublicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidPrivateKey.replace(/\n/g, '\\n'));
console.log('VAPID_SUBJECT=' + frontendUrl);
console.log('\n📝 Note: Keep the private key secure and never commit it to version control!');
console.log('\n💡 The VAPID_PRIVATE_KEY should be the full PEM format (with \\n for newlines).');

