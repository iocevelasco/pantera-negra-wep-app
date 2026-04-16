/**
 * Whitelist Service
 * 
 * Servicio para gestionar la whitelist de administradores.
 * Los usuarios con email en la whitelist serán considerados administradores.
 * 
 * Configuración mediante:
 * 1. Archivo JSON: src/config/admin-whitelist.json
 * 2. Variables de entorno (tienen prioridad sobre el archivo):
 *    - ADMIN_WHITELIST: Lista de emails separados por comas (ej: "admin@example.com,user@example.com")
 *    - ADMIN_WHITELIST_JSON: JSON que mapea emails a arrays de tenant IDs (ej: {"admin@example.com": ["tenant1", "tenant2"]})
 * 
 * Si ADMIN_WHITELIST_JSON está vacío o no contiene el email, el usuario será admin en todos los tenants.
 * Si ADMIN_WHITELIST_JSON contiene el email con un array de tenant IDs, el usuario será admin solo en esos tenants.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ADMIN_WHITELIST_CONFIG } from '../config/app.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface WhitelistConfig {
  emails: Set<string>;
  emailToTenants: Record<string, string[]>;
}

class WhitelistService {
  private config: WhitelistConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Carga la configuración de whitelist desde archivo JSON y variables de entorno
   * Las variables de entorno tienen prioridad sobre el archivo JSON
   */
  private loadConfig(): WhitelistConfig {
    const emails = new Set<string>();
    let emailToTenants: Record<string, string[]> = {};

    // 1. Cargar desde archivo JSON (si existe)
    try {
      // Intentar múltiples rutas posibles para encontrar el archivo de configuración
      const possiblePaths = [
        join(__dirname, '../config/admin-whitelist.json'), // Desde dist/services/../config
        join(__dirname, '../../config/admin-whitelist.json'), // Desde dist/services/../../config
        join(process.cwd(), 'src/config/admin-whitelist.json'), // Desde packages/api/src/config
        join(process.cwd(), 'packages/api/src/config/admin-whitelist.json'), // Desde monorepo root
        join(process.cwd(), 'config/admin-whitelist.json'), // Desde packages/api/config
      ];

      let configPath: string | null = null;
      for (const path of possiblePaths) {
        if (existsSync(path)) {
          configPath = path;
          break;
        }
      }

      if (!configPath) {
        throw new Error('Config file not found in any of the expected paths');
      }

      const fileContent = readFileSync(configPath, 'utf-8');
      const fileConfig = JSON.parse(fileContent);

      // Cargar emails del archivo
      if (Array.isArray(fileConfig.emails)) {
        fileConfig.emails.forEach((email: string) => {
          const normalizedEmail = email.toLowerCase().trim();
          if (normalizedEmail.length > 0) {
            emails.add(normalizedEmail);
          }
        });
      }

      // Cargar mapeo de emails a tenants del archivo
      if (fileConfig.emailToTenants && typeof fileConfig.emailToTenants === 'object') {
        for (const [email, tenants] of Object.entries(fileConfig.emailToTenants)) {
          const normalizedEmail = email.toLowerCase().trim();
          emailToTenants[normalizedEmail] = Array.isArray(tenants) ? tenants : [];
          // Asegurar que el email también esté en el set de emails
          emails.add(normalizedEmail);
        }
      }

      console.log(`✅ [WHITELIST] Loaded ${emails.size} admin emails from config file`);
    } catch (error) {
      // El archivo no existe o hay un error, continuar con variables de entorno
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.warn('⚠️  [WHITELIST] Error loading config file, using environment variables only:', error);
      }
    }

    // 2. Cargar desde variables de entorno (tienen prioridad)
    const adminWhitelistEnv = ADMIN_WHITELIST_CONFIG.WHITELIST;
    const envEmails = adminWhitelistEnv
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);

    envEmails.forEach((email) => {
      emails.add(email);
    });

    // Cargar mapeo de emails a tenants desde variables de entorno
    try {
      const adminWhitelistJsonEnv = ADMIN_WHITELIST_CONFIG.WHITELIST_JSON;
      if (adminWhitelistJsonEnv) {
        const parsed = JSON.parse(adminWhitelistJsonEnv);
        // Normalizar todas las claves (emails) a lowercase
        for (const [email, tenants] of Object.entries(parsed)) {
          const normalizedEmail = email.toLowerCase().trim();
          // Las variables de entorno sobrescriben el archivo
          emailToTenants[normalizedEmail] = Array.isArray(tenants) ? tenants : [];
          // Asegurar que el email también esté en el set de emails
          emails.add(normalizedEmail);
        }
      }
    } catch (error) {
      console.error('❌ [WHITELIST] Error parsing ADMIN_WHITELIST_JSON:', error);
    }

    console.log(`✅ [WHITELIST] Total: ${emails.size} admin emails in whitelist`);
    if (Object.keys(emailToTenants).length > 0) {
      console.log(`✅ [WHITELIST] Tenant mappings for ${Object.keys(emailToTenants).length} emails`);
    }

    return {
      emails,
      emailToTenants,
    };
  }

  /**
   * Recarga la configuración de whitelist (útil para actualizar sin reiniciar)
   */
  reloadConfig(): void {
    this.config = this.loadConfig();
    console.log('🔄 [WHITELIST] Configuration reloaded');
  }

  /**
   * Normaliza un email para comparación
   */
  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Verifica si un email está en la whitelist de administradores
   */
  isAdminWhitelisted(email: string): boolean {
    const normalizedEmail = this.normalizeEmail(email);
    const isWhitelisted = this.config.emails.has(normalizedEmail);
    
    if (isWhitelisted) {
      console.log(`✅ [WHITELIST] Email "${normalizedEmail}" is whitelisted as admin`);
    }
    
    return isWhitelisted;
  }

  /**
   * Obtiene los tenant IDs asociados a un email en la whitelist
   * Retorna un array vacío si el email no está en la whitelist o si no hay restricciones de tenant
   * Retorna un array con tenant IDs si el email tiene tenants específicos asignados
   */
  getAdminTenants(email: string): string[] {
    const normalizedEmail = this.normalizeEmail(email);
    
    if (!this.config.emails.has(normalizedEmail)) {
      return [];
    }

    const tenants = this.config.emailToTenants[normalizedEmail];
    
    // Si no hay mapeo específico, retornar array vacío (admin en todos los tenants)
    if (!tenants || tenants.length === 0) {
      console.log(`✅ [WHITELIST] Email "${normalizedEmail}" is admin for all tenants`);
      return [];
    }

    console.log(`✅ [WHITELIST] Email "${normalizedEmail}" is admin for tenants: ${tenants.join(', ')}`);
    return tenants;
  }

  /**
   * Verifica si un email es admin para un tenant específico
   * Retorna true si:
   * - El email está en la whitelist Y
   * - No hay restricciones de tenant (array vacío) O el tenant está en la lista de tenants permitidos
   */
  isAdminForTenant(email: string, tenantId: string): boolean {
    const normalizedEmail = this.normalizeEmail(email);
    
    if (!this.isAdminWhitelisted(normalizedEmail)) {
      return false;
    }

    const allowedTenants = this.getAdminTenants(normalizedEmail);
    
    // Si no hay restricciones (array vacío), es admin en todos los tenants
    if (allowedTenants.length === 0) {
      return true;
    }

    // Verificar si el tenant está en la lista permitida
    return allowedTenants.includes(tenantId);
  }

  /**
   * Obtiene todos los emails en la whitelist (útil para debugging)
   */
  getAllWhitelistedEmails(): string[] {
    return Array.from(this.config.emails);
  }

  /**
   * Obtiene el mapeo completo de emails a tenants (útil para debugging)
   */
  getEmailToTenantsMap(): Record<string, string[]> {
    return { ...this.config.emailToTenants };
  }
}

// Exportar instancia singleton
export const whitelistService = new WhitelistService();

// Exportar clase para testing si es necesario
export { WhitelistService };

