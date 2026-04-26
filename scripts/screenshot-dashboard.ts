/**
 * Captura screenshot del dashboard — genera token directo desde DB
 * Uso: pnpm --filter api exec tsx ../../scripts/screenshot-dashboard.ts
 */
import { chromium } from '@playwright/test';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import path from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

// Load API env
dotenv.config({ path: path.join(__dir, '../packages/api/.env') });

const APP_URL = 'https://pantera-negra-app.fly.dev';

async function generateToken() {
  // Dynamic imports to use API internals
  const { connectDatabase } = await import('../packages/api/src/config/database.js');
  const { UserModel } = await import('../packages/api/src/models/User.js');
  const { AuthService } = await import('../packages/api/src/services/auth.service.js');

  await connectDatabase();

  const user = await UserModel.findOne({ email: 'admin@panteranegra.com.br' }).lean();
  if (!user) throw new Error('Admin user not found');

  const tenantId = user.tenant_id?.toString();
  if (!tenantId) throw new Error('User has no tenant');

  const tokens = await AuthService.generateTokens(
    user._id.toString(),
    user.email,
    tenantId
  );

  return {
    token: tokens.accessToken,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      roles: user.roles,
    },
  };
}

async function capture() {
  console.log('🔑 Generating token from DB...');
  const { token, user } = await generateToken();
  console.log(`✅ Token generated for ${user.email}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Land on app and inject auth
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user-storage', JSON.stringify({
      state: { user, isLoading: false, isInitialized: true },
      version: 0,
    }));
  }, { token, user });

  const outDir = join(__dir, '../packages/landing/public');

  // Screenshot 1 — Members page
  console.log('📸 Capturing members page...');
  await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: join(outDir, 'screenshot-dashboard.png') });
  console.log('✅ screenshot-dashboard.png');

  // Screenshot 2 — Panel / stats
  console.log('📸 Capturing stats panel...');
  await page.goto(`${APP_URL}/panel`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: join(outDir, 'screenshot-panel.png') });
  console.log('✅ screenshot-panel.png');

  await browser.close();
  console.log('\n📁 Screenshots saved to packages/landing/public/');

  process.exit(0);
}

capture().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
