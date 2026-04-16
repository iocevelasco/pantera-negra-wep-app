import { UserModel } from '../models/User.js';
import mongoose from 'mongoose';

// Type definitions for Resend (to avoid TypeScript errors when package is not installed)
type ResendClient = {
  emails: {
    send: (options: {
      from: string;
      to: string;
      subject: string;
      html: string;
      text: string;
    }) => Promise<unknown>;
  };
};

// Lazy initialization of Resend client
let resendClient: ResendClient | null = null;
let resendInitialized = false;

import { EMAIL_CONFIG } from '../config/app.config.js';

async function getResendClient(): Promise<ResendClient | null> {
  if (resendInitialized) {
    return resendClient;
  }

  try {
    // Dynamic import of resend package
    // @ts-ignore - Resend types may not be available during local development
    const resendModule = await import('resend');
    const Resend = resendModule.Resend;
    const resendApiKey = EMAIL_CONFIG.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.warn('⚠️  [EMAIL] RESEND_API_KEY not set. Email service may not work correctly.');
    }

    resendClient = new Resend(resendApiKey) as ResendClient;
    resendInitialized = true;
    console.log('✅ [EMAIL] Resend client initialized');
    return resendClient;
  } catch (error) {
    console.warn('⚠️  [EMAIL] Resend module not available. Email service will be disabled.');
    console.warn('⚠️  [EMAIL] Install resend package: pnpm add resend');
    resendInitialized = true; // Mark as initialized to avoid repeated warnings
    return null;
  }
}

// Email configuration
const FROM_EMAIL = EMAIL_CONFIG.FROM_EMAIL;
const FRONTEND_URL = EMAIL_CONFIG.FRONTEND_URL;
const APP_NAME = EMAIL_CONFIG.APP_NAME;

export class EmailService {
  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resend = await getResendClient();
    if (!resend) {
      return;
    }

    try {
      const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Restablecer Contraseña - ${APP_NAME}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #1a1a1a; margin-top: 0;">Restablecer Contraseña</h1>
              <p>Hola,</p>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en ${APP_NAME}.</p>
              <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Restablecer Contraseña
                </a>
              </div>
              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
              <p><strong>Este enlace expirará en 1 hora.</strong></p>
              <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #666;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </div>
          </body>
        </html>
      `;

      const text = `
Restablecer Contraseña - ${APP_NAME}

Hola,

Recibimos una solicitud para restablecer la contraseña de tu cuenta en ${APP_NAME}.

Haz clic en el siguiente enlace para restablecer tu contraseña:
${resetUrl}

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
      `;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Restablecer Contraseña - ${APP_NAME}`,
        html,
        text,
      });

      console.log(`✅ [EMAIL] Password reset email sent to: ${email}`);
    } catch (error) {
      console.error('❌ [EMAIL] Failed to send password reset email:', error);
      // Don't throw error - we don't want to expose email failures to users
      // Log it for monitoring
    }
  }

  /**
   * Send registration pending notification to user
   */
  static async sendRegistrationPendingEmail(email: string, userName?: string): Promise<void> {
    const resend = await getResendClient();
    if (!resend) {
      return;
    }

    try {
      const name = userName || email.split('@')[0];

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Solicitud de Registro Recibida - ${APP_NAME}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #1a1a1a; margin-top: 0;">¡Solicitud de Registro Recibida!</h1>
              <p>Hola ${name},</p>
              <p>Gracias por registrarte en ${APP_NAME}. Hemos recibido tu solicitud de registro.</p>
              <p><strong>Tu solicitud está siendo revisada por nuestro equipo de administración.</strong></p>
              <p>Te notificaremos por correo electrónico una vez que tu registro haya sido aprobado.</p>
              <p>Mientras tanto, puedes iniciar sesión con tus credenciales, pero tu acceso estará limitado hasta que se apruebe tu registro.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #666;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </div>
          </body>
        </html>
      `;

      const text = `
¡Solicitud de Registro Recibida! - ${APP_NAME}

Hola ${name},

Gracias por registrarte en ${APP_NAME}. Hemos recibido tu solicitud de registro.

Tu solicitud está siendo revisada por nuestro equipo de administración.

Te notificaremos por correo electrónico una vez que tu registro haya sido aprobado.
      `;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Solicitud de Registro Recibida - ${APP_NAME}`,
        html,
        text,
      });

      console.log(`✅ [EMAIL] Registration pending email sent to: ${email}`);
    } catch (error) {
      console.error('❌ [EMAIL] Failed to send registration pending email:', error);
    }
  }

  /**
   * Send registration confirmation email to user
   */
  static async sendRegistrationConfirmedEmail(
    email: string,
    userName?: string,
    loginUrl?: string
  ): Promise<void> {
    const resend = await getResendClient();
    if (!resend) {
      return;
    }

    try {
      const name = userName || email.split('@')[0];
      const loginLink = loginUrl || `${FRONTEND_URL}/login`;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>¡Registro Aprobado! - ${APP_NAME}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #28a745; margin-top: 0;">¡Registro Aprobado!</h1>
              <p>Hola ${name},</p>
              <p>¡Excelente noticia! Tu solicitud de registro en ${APP_NAME} ha sido <strong>aprobada</strong>.</p>
              <p>Ya puedes acceder a todas las funcionalidades de la plataforma.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginLink}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Iniciar Sesión
                </a>
              </div>
              <p>¡Bienvenido a ${APP_NAME}!</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #666;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </div>
          </body>
        </html>
      `;

      const text = `
¡Registro Aprobado! - ${APP_NAME}

Hola ${name},

¡Excelente noticia! Tu solicitud de registro en ${APP_NAME} ha sido aprobada.

Ya puedes acceder a todas las funcionalidades de la plataforma.

Inicia sesión aquí: ${loginLink}

¡Bienvenido a ${APP_NAME}!
      `;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `¡Registro Aprobado! - ${APP_NAME}`,
        html,
        text,
      });

      console.log(`✅ [EMAIL] Registration confirmed email sent to: ${email}`);
    } catch (error) {
      console.error('❌ [EMAIL] Failed to send registration confirmed email:', error);
    }
  }

  /**
   * Send registration rejection email to user
   */
  static async sendRegistrationRejectedEmail(
    email: string,
    userName?: string,
    reason?: string
  ): Promise<void> {
    const resend = await getResendClient();
    if (!resend) {
      return;
    }

    try {
      const name = userName || email.split('@')[0];

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Solicitud de Registro - ${APP_NAME}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #dc3545; margin-top: 0;">Solicitud de Registro</h1>
              <p>Hola ${name},</p>
              <p>Lamentamos informarte que tu solicitud de registro en ${APP_NAME} no ha sido aprobada en este momento.</p>
              ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
              <p>Si tienes preguntas o deseas más información, por favor contacta a la administración del dojo.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #666;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </div>
          </body>
        </html>
      `;

      const text = `
Solicitud de Registro - ${APP_NAME}

Hola ${name},

Lamentamos informarte que tu solicitud de registro en ${APP_NAME} no ha sido aprobada en este momento.

${reason ? `Motivo: ${reason}` : ''}

Si tienes preguntas o deseas más información, por favor contacta a la administración del dojo.
      `;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Solicitud de Registro - ${APP_NAME}`,
        html,
        text,
      });

      console.log(`✅ [EMAIL] Registration rejected email sent to: ${email}`);
    } catch (error) {
      console.error('❌ [EMAIL] Failed to send registration rejected email:', error);
    }
  }

  /**
   * Send notification to admins about new registration request
   */
  static async sendNewRegistrationNotificationToAdmins(
    adminEmails: string[],
    userEmail: string,
    userName?: string,
    tenantName?: string
  ): Promise<void> {
    const resend = await getResendClient();
    if (!resend) {
      return;
    }

    try {
      if (adminEmails.length === 0) {
        console.log('⚠️  [EMAIL] No admin emails provided for new registration notification');
        return;
      }

      const name = userName || userEmail.split('@')[0];
      const tenant = tenantName || 'el dojo';

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nueva Solicitud de Registro - ${APP_NAME}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
              <h1 style="color: #856404; margin-top: 0;">Nueva Solicitud de Registro</h1>
              <p>Se ha recibido una nueva solicitud de registro que requiere tu revisión.</p>
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>Usuario:</strong> ${name}</p>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Sede:</strong> ${tenant}</p>
              </div>
              <p>Por favor, revisa la solicitud en el panel de administración.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${FRONTEND_URL}/admin/registrations" style="background-color: #ffc107; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Ver Solicitudes
                </a>
              </div>
            </div>
          </body>
        </html>
      `;

      const text = `
Nueva Solicitud de Registro - ${APP_NAME}

Se ha recibido una nueva solicitud de registro que requiere tu revisión.

Usuario: ${name}
Email: ${userEmail}
Sede: ${tenant}

Por favor, revisa la solicitud en el panel de administración: ${FRONTEND_URL}/admin/registrations
      `;

      // Send to all admin emails
      await Promise.all(
        adminEmails.map((adminEmail) =>
          resend.emails.send({
            from: FROM_EMAIL,
            to: adminEmail,
            subject: `Nueva Solicitud de Registro - ${APP_NAME}`,
            html,
            text,
          })
        )
      );

      console.log(`✅ [EMAIL] New registration notification sent to ${adminEmails.length} admin(s)`);
    } catch (error) {
      console.error('❌ [EMAIL] Failed to send new registration notification to admins:', error);
    }
  }

  /**
   * Get admin emails for a specific tenant
   */
  static async getAdminEmailsForTenant(tenantId: string): Promise<string[]> {
    try {
      const adminUsers = await UserModel.find({
        tenant_id: new mongoose.Types.ObjectId(tenantId),
        role: { $in: ['admin', 'owner'] },
        email: { $exists: true, $ne: null },
      })
        .select('email')
        .lean();

      return adminUsers.map((user) => user.email).filter((email): email is string => !!email);
    } catch (error) {
      console.error('❌ [EMAIL] Failed to get admin emails for tenant:', error);
      return [];
    }
  }
}

