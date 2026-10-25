import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

export class EmailService {
  private static getTransporter() {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER && env.SMTP_PASS ? {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      } : undefined,
    });
  }

  /**
   * Master responsive dark-luxury email layout for all organizational emails.
   */
  private static renderMasterLayout(options: {
    title: string;
    preheader?: string;
    bodyContent: string;
    footerNote?: string;
  }): string {
    const { title, preheader, bodyContent, footerNote } = options;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #0b0f19;
      padding: 35px 12px;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background: #131926;
      border: 1px solid #1e293b;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.65);
    }
    .header {
      padding: 28px 24px 20px 24px;
      text-align: center;
      background: linear-gradient(180deg, rgba(249, 115, 22, 0.09) 0%, transparent 100%);
      border-bottom: 1px solid #1e293b;
    }
    .logo-img {
      height: 40px;
      width: auto;
      margin-bottom: 6px;
    }
    .tagline {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #94a3b8;
      font-weight: 600;
    }
    .content {
      padding: 32px 28px;
    }
    .cta-btn {
      display: inline-block;
      background: #f97316;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 12px 26px;
      border-radius: 8px;
      margin: 20px 0 10px 0;
      box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35);
    }
    .security-notice {
      background: rgba(249, 115, 22, 0.06);
      border-left: 3px solid #f97316;
      border-radius: 6px;
      padding: 12px 16px;
      font-size: 12px;
      line-height: 1.5;
      color: #94a3b8;
      margin: 24px 0 0 0;
      text-align: left;
    }
    .footer {
      padding: 24px 28px;
      text-align: center;
      border-top: 1px solid #1e293b;
      background: #0d121d;
    }
    .footer-text {
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
      margin: 0 0 6px 0;
    }
    .footer-links a {
      color: #f97316;
      text-decoration: none;
      margin: 0 8px;
    }
  </style>
</head>
<body>
  ${preheader ? `<span style="display:none;font-size:1px;color:#0b0f19;max-height:0px;overflow:hidden;">${preheader}</span>` : ''}
  <div class="wrapper">
    <div class="container">
      <!-- Master Header -->
      <div class="header">
        <img src="cid:akmart_logo" alt="AKMart" class="logo-img" />
        <div class="tagline">Nepal's Trusted Digital Marketplace</div>
      </div>

      <!-- Dynamic Content -->
      <div class="content">
        ${bodyContent}
      </div>

      <!-- Master Footer -->
      <div class="footer">
        ${footerNote ? `<div style="font-size:12px;color:#94a3b8;margin-bottom:12px;">${footerNote}</div>` : ''}
        <p class="footer-text">
          Need support? Reach out to <a href="mailto:support@akmart.com" style="color:#f97316;text-decoration:none;">support@akmart.com</a>
        </p>
        <p class="footer-text" style="font-size: 11px; color: #475569;">
          &copy; ${new Date().getFullYear()} AKMart Inc. Durbar Marg, Kathmandu, Nepal. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Helper to dispatch email via Nodemailer with attached CID logo.
   */
  private static async sendRaw(to: string, subject: string, html: string) {
    if (env.NODE_ENV === 'test') return;

    if (!env.SMTP_USER || env.SMTP_USER === 'your_ethereal_user@ethereal.email') {
      console.log(`\n======================================================`);
      console.log(`📧 [TRANSACTIONAL EMAIL MOCK] To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content:\n${html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()}`);
      console.log(`======================================================\n`);
      return;
    }

    try {
      const transporter = this.getTransporter();
      const attachments: any[] = [];
      const logoPath = path.resolve(__dirname, '../assets/logo.png');
      if (fs.existsSync(logoPath)) {
        attachments.push({
          filename: 'logo.png',
          path: logoPath,
          cid: 'akmart_logo',
        });
      }

      await transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html,
        attachments,
      });
      console.log(`[EMAIL DISPATCHED] "${subject}" to ${to}`);
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to send email to', to, error);
    }
  }

  // -------------------------------------------------------------
  // BUSINESS EMAIL TEMPLATES
  // -------------------------------------------------------------

  /**
   * 1. Email Verification OTP with Reassuring Copy and 1-Click Revocation
   */
  static async sendVerificationEmail(to: string, otp: string, cancelUrl?: string) {
    const title = 'Confirm Your Email Address';
    const bodyContent = `
      <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 10px 0;text-align:center;">
        Confirm Your Email Address
      </h1>
      <p style="font-size:14px;line-height:1.6;color:#94a3b8;margin:0 0 24px 0;text-align:center;">
        We received a request to create an AKMart account using this email address. Enter this verification code to complete your registration:
      </p>

      <div style="background:#0f1523;border:2px dashed #f97316;border-radius:12px;padding:20px 10px;text-align:center;margin-bottom:20px;">
        <span style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:800;letter-spacing:12px;color:#f97316;padding-left:12px;">
          ${otp}
        </span>
      </div>

      <div style="text-align:center;margin-bottom:20px;">
        <span style="display:inline-block;font-size:12px;color:#cbd5e1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:6px 14px;border-radius:20px;">
          ⏳ Valid for 15 minutes &bull; Single use only
        </span>
      </div>

      <div style="background:#171d2b;border:1px solid #252f44;border-radius:10px;padding:16px 20px;text-align:left;margin-top:24px;font-size:13px;color:#94a3b8;line-height:1.6;">
        <strong style="color:#ffffff;display:block;margin-bottom:6px;">🛡️ Didn't create an AKMart account?</strong>
        If you did not request this, you can safely ignore this email. <strong>No account will be activated</strong> without entering this code, and your email address remains completely safe.
        ${cancelUrl ? `
          <div style="margin-top:10px;padding-top:10px;border-top:1px solid #252f44;">
            <a href="${cancelUrl}" style="color:#ef4444;font-weight:600;text-decoration:underline;">
              Click here to cancel and remove this registration immediately &rarr;
            </a>
          </div>
        ` : ''}
      </div>

      <div class="security-notice" style="margin-top:20px;">
        <strong>Security Tip:</strong> Never share this code with anyone. AKMart team members will never ask for your password or verification code.
      </div>
    `;

    const html = this.renderMasterLayout({ title, bodyContent });
    await this.sendRaw(to, `AKMart - Your Verification Code is ${otp}`, html);
  }

  /**
   * 2. Password Reset OTP
   */
  static async sendPasswordResetEmail(to: string, otp: string) {
    const title = 'Reset Your Password';
    const bodyContent = `
      <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 10px 0;text-align:center;">
        Reset Your Password
      </h1>
      <p style="font-size:14px;line-height:1.6;color:#94a3b8;margin:0 0 24px 0;text-align:center;">
        We received a request to reset your AKMart account password. Enter this verification code to proceed.
      </p>

      <div style="background:#0f1523;border:2px dashed #f97316;border-radius:12px;padding:20px 10px;text-align:center;margin-bottom:20px;">
        <span style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:800;letter-spacing:12px;color:#f97316;padding-left:12px;">
          ${otp}
        </span>
      </div>

      <div style="text-align:center;margin-bottom:20px;">
        <span style="display:inline-block;font-size:12px;color:#cbd5e1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:6px 14px;border-radius:20px;">
          ⏳ Valid for 15 minutes
        </span>
      </div>

      <div class="security-notice">
        <strong>Security Alert:</strong> If you did not request this password reset, please change your credentials immediately or contact support.
      </div>
    `;

    const html = this.renderMasterLayout({ title, bodyContent });
    await this.sendRaw(to, 'AKMart - Password Reset Code', html);
  }

  /**
   * 3. Welcome Email
   */
  static async sendWelcomeEmail(to: string, fullName: string) {
    const title = 'Welcome to AKMart!';
    const bodyContent = `
      <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 10px 0;text-align:center;">
        Welcome to AKMart, ${fullName}! 🎉
      </h1>
      <p style="font-size:14px;line-height:1.6;color:#94a3b8;margin:0 0 24px 0;text-align:center;">
        Your account has been verified. Discover top electronics, fashion, and home essentials with fast nationwide delivery.
      </p>

      <div style="background:#0f1523;border:1px solid #1e293b;border-radius:12px;padding:20px;margin-bottom:24px;text-align:left;">
        <div style="color:#ffffff;font-size:14px;font-weight:600;margin-bottom:12px;">What you can do with AKMart:</div>
        <div style="color:#94a3b8;font-size:13px;line-height:1.8;">
          &bull; 🚚 <strong>Nationwide Delivery:</strong> Fast express shipping across Nepal.<br/>
          &bull; 🛡️ <strong>100% Genuine Brands:</strong> Verified sellers and authentic quality.<br/>
          &bull; ⚡ <strong>Atomic Real-time Inventory:</strong> What you buy is guaranteed reserved.
        </div>
      </div>

      <div style="text-align:center;">
        <a href="${env.FRONTEND_WEB_URL}/collection" class="cta-btn">
          Start Shopping Now &rarr;
        </a>
      </div>
    `;

    const html = this.renderMasterLayout({ title, bodyContent });
    await this.sendRaw(to, 'Welcome to AKMart! Let\'s get started', html);
  }

  /**
   * 4. Order Confirmation Email
   */
  static async sendOrderConfirmationEmail(to: string, order: any) {
    const orderIdShort = order.id ? order.id.slice(-8).toUpperCase() : 'ORD';
    const title = `Order Confirmed #${orderIdShort}`;

    const itemsHtml = (order.items || []).map((item: any) => {
      const name = item.sellerListing?.variant?.product?.name || 'Product Item';
      const variantName = item.sellerListing?.variant?.name || '';
      const price = Number(item.price || 0);
      const qty = item.quantity || 1;
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #1e293b;color:#e2e8f0;font-size:13px;">
            <strong>${name}</strong> ${variantName ? `<span style="color:#94a3b8;font-size:11px;">(${variantName})</span>` : ''}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #1e293b;color:#94a3b8;font-size:13px;text-align:center;">
            x${qty}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #1e293b;color:#f97316;font-size:13px;text-align:right;font-weight:600;">
            Rs. ${(price * qty).toLocaleString()}
          </td>
        </tr>
      `;
    }).join('');

    const bodyContent = `
      <div style="text-align:center;margin-bottom:20px;">
        <div style="display:inline-block;background:rgba(34,197,94,0.1);border:1px solid #22c55e;color:#22c55e;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;">
          ✓ Order Confirmed
        </div>
      </div>

      <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 8px 0;text-align:center;">
        Thank You for Your Order!
      </h1>
      <p style="font-size:13px;color:#94a3b8;margin:0 0 24px 0;text-align:center;">
        Order ID: <strong style="color:#ffffff;">#${orderIdShort}</strong> &bull; Payment: <strong style="color:#ffffff;">${order.paymentMethod || 'COD'}</strong>
      </p>

      <div style="background:#0f1523;border:1px solid #1e293b;border-radius:12px;padding:20px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;padding-bottom:8px;">Item</th>
              <th style="text-align:center;font-size:11px;color:#64748b;text-transform:uppercase;padding-bottom:8px;">Qty</th>
              <th style="text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;padding-bottom:8px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding-top:14px;color:#ffffff;font-size:14px;font-weight:700;">Total Amount</td>
              <td style="padding-top:14px;color:#f97316;font-size:16px;font-weight:800;text-align:right;">
                Rs. ${Number(order.totalAmount || 0).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="text-align:center;">
        <a href="${env.FRONTEND_WEB_URL}/orders" class="cta-btn">
          View & Track Order &rarr;
        </a>
      </div>
    `;

    const html = this.renderMasterLayout({ title, bodyContent });
    await this.sendRaw(to, `Order Confirmed #${orderIdShort} - AKMart`, html);
  }

  /**
   * 5. Seller Verification & Status Email
   */
  static async sendSellerStatusEmail(to: string, shopName: string, isApproved: boolean) {
    const title = isApproved ? 'Seller Account Verified!' : 'Seller Account Status Update';
    const bodyContent = isApproved ? `
      <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 10px 0;text-align:center;">
        Congratulations, ${shopName}! 🎉
      </h1>
      <p style="font-size:14px;line-height:1.6;color:#94a3b8;margin:0 0 24px 0;text-align:center;">
        Your vendor profile has been approved by the AKMart Administrator team. Payouts and listing permissions are now enabled!
      </p>

      <div style="text-align:center;">
        <a href="${env.FRONTEND_WEB_URL}/seller/dashboard" class="cta-btn">
          Go to Seller Dashboard &rarr;
        </a>
      </div>
    ` : `
      <h1 style="font-size:22px;font-weight:700;color:#ffffff;margin:0 0 10px 0;text-align:center;">
        Seller Account Notice: ${shopName}
      </h1>
      <p style="font-size:14px;line-height:1.6;color:#94a3b8;margin:0 0 24px 0;text-align:center;">
        Your seller shop privileges have been temporarily suspended. Please reach out to <a href="mailto:support@akmart.com" style="color:#f97316;">support@akmart.com</a> to review compliance requirements.
      </p>
    `;

    const html = this.renderMasterLayout({ title, bodyContent });
    await this.sendRaw(to, title + ' - AKMart', html);
  }
}
