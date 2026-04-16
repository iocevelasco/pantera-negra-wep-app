#!/usr/bin/env node

/**
 * Script para incrementar la versión minor en packages/web/package.json
 * Uso: node scripts/bump-version.js
 */

const fs = require('fs');
const path = require('path');

const webPackageJsonPath = path.resolve(__dirname, '../packages/web/package.json');

try {
  // Leer el package.json
  const packageJson = JSON.parse(fs.readFileSync(webPackageJsonPath, 'utf-8'));
  const currentVersion = packageJson.version;

  // Parsear la versión (formato: major.minor.patch)
  const versionParts = currentVersion.split('.');
  if (versionParts.length !== 3) {
    throw new Error(`Versión inválida: ${currentVersion}. Debe ser formato semver (major.minor.patch)`);
  }

  const major = parseInt(versionParts[0], 10);
  const minor = parseInt(versionParts[1], 10);
  const patch = parseInt(versionParts[2], 10);

  // Incrementar la versión minor y resetear patch a 0
  const newVersion = `${major}.${minor + 1}.0`;

  // Actualizar el package.json
  packageJson.version = newVersion;
  fs.writeFileSync(
    webPackageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf-8'
  );

  console.log(`✓ Versión actualizada: ${currentVersion} → ${newVersion}`);
  console.log(`✓ Archivo actualizado: ${webPackageJsonPath}`);
} catch (error) {
  console.error('❌ Error al incrementar la versión:', error.message);
  process.exit(1);
}

