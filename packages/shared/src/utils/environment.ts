/**
 * Environment Detection Utilities
 * 
 * Shared utilities for detecting environment (production/development)
 * that work in both browser (frontend) and Node.js (backend) contexts.
 */

// Type declarations for browser and Node.js globals
declare const window: (Window & typeof globalThis) | undefined;
declare const process: NodeJS.Process | undefined;

export type Environment = 'production' | 'development' | 'test';

export interface EnvironmentInfo {
  environment: Environment;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  hostname: string | null;
  isLocalhost: boolean;
  isFlyDev: boolean;
  isPanteraNegra: boolean;
}

/**
 * Gets the hostname from the current context
 * - In browser: window.location.hostname
 * - In Node.js: process.env.HOSTNAME or null
 */
export function getHostname(): string | null {
  // Browser context
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hostname;
  }
  
  // Node.js context
  if (typeof process !== 'undefined') {
    return process.env.HOSTNAME || null;
  }
  
  return null;
}

/**
 * Checks if the current hostname is localhost
 */
export function isLocalhost(hostname?: string | null): boolean {
  const host = hostname ?? getHostname();
  if (!host) return false;
  
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    host.startsWith('172.')
  );
}

/**
 * Checks if the current hostname is a Fly.dev domain
 */
export function isFlyDev(hostname?: string | null): boolean {
  const host = hostname ?? getHostname();
  if (!host) return false;
  
  return host.includes('fly.dev');
}

/**
 * Checks if the current hostname is a Pantera Negra domain
 */
export function isPanteraNegra(hostname?: string | null): boolean {
  const host = hostname ?? getHostname();
  if (!host) return false;
  
  return host.includes('pantera-negra');
}

/**
 * Detects if we're in a production environment
 * - Checks hostname for production domains (fly.dev, pantera-negra)
 * - Falls back to NODE_ENV or Vite MODE in browser
 */
export function isProduction(hostname?: string | null): boolean {
  const host = hostname ?? getHostname();
  
  // Check hostname first (most reliable)
  if (host) {
    if (isFlyDev(host) || isPanteraNegra(host)) {
      return true;
    }
    
    // If not localhost and not a known dev domain, might be production
    if (!isLocalhost(host)) {
      // In browser, check Vite MODE
      if (typeof window !== 'undefined') {
        // @ts-ignore - Vite env variables
        const mode = import.meta?.env?.MODE;
        if (mode === 'production') {
          return true;
        }
      }
      
      // In Node.js, check NODE_ENV
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
        return true;
      }
    }
  }
  
  // Fallback to environment variables
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
    return true;
  }
  
  // @ts-ignore - Vite env variables
  if (typeof window !== 'undefined' && import.meta?.env?.MODE === 'production') {
    return true;
  }
  
  return false;
}

/**
 * Detects if we're in a development environment
 */
export function isDevelopment(hostname?: string | null): boolean {
  return !isProduction(hostname);
}

/**
 * Gets the current environment type
 */
export function getEnvironment(hostname?: string | null): Environment {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return 'test';
  }
  
  return isProduction(hostname) ? 'production' : 'development';
}

/**
 * Gets comprehensive environment information
 */
export function getEnvironmentInfo(hostname?: string | null): EnvironmentInfo {
  const host = hostname ?? getHostname();
  const env = getEnvironment(host);
  const prod = isProduction(host);
  const dev = isDevelopment(host);
  
  return {
    environment: env,
    isProduction: prod,
    isDevelopment: dev,
    isTest: env === 'test',
    hostname: host,
    isLocalhost: isLocalhost(host),
    isFlyDev: isFlyDev(host),
    isPanteraNegra: isPanteraNegra(host),
  };
}

/**
 * Gets the API base URL based on the current environment
 * - Production: returns empty string (relative URLs)
 * - Development: returns provided dev URL or default localhost:8080
 */
export function getApiBaseUrl(
  devUrl?: string,
  productionUrl: string = ''
): string {
  if (isProduction()) {
    return productionUrl;
  }
  
  return devUrl || 'http://localhost:8080';
}

/**
 * Checks if reCAPTCHA should be enabled
 * - Enabled in production (non-localhost)
 * - Disabled in development/localhost
 */
export function shouldEnableRecaptcha(hostname?: string | null): boolean {
  const host = hostname ?? getHostname();
  
  // Disable on localhost
  if (isLocalhost(host)) {
    return false;
  }
  
  // Enable in production
  return isProduction(host);
}

