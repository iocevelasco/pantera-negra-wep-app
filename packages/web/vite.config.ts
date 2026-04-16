import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync, writeFileSync } from 'fs';

// Leer la versión del package.json
const packageJson = JSON.parse(readFileSync(path.resolve(__dirname, './package.json'), 'utf-8'));
const appVersion = packageJson.version;

// Plugin para generar version.json durante el build
function versionPlugin(): Plugin {
  return {
    name: 'version-plugin',
    writeBundle(options) {
      const versionData = {
        version: appVersion,
        buildTime: new Date().toISOString(),
      };
      const outDir = options.dir || 'dist';
      writeFileSync(
        path.resolve(__dirname, outDir, 'version.json'),
        JSON.stringify(versionData, null, 2)
      );
      console.log(`✓ Generated version.json (v${appVersion})`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), versionPlugin()],
  define: {
    // Inyectar la versión de la app como variable de entorno
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
  },
  envPrefix: 'VITE_',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

