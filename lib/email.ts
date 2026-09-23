// lib/email.ts
import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Send email function
export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Wahisnova" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error };
  }
}

// OTP Email Template
export function getOtpEmailTemplate(name: string, otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          background: #f4f4f4; 
          padding: 20px; 
          margin: 0;
        }
        .container { 
          max-width: 500px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #6366f1, #8b5cf6); 
          color: white; 
          padding: 30px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px;
          font-weight: bold;
        }
        .content { 
          padding: 40px 30px; 
          text-align: center; 
        }
        .content h2 {
          color: #1f2937;
          margin-top: 0;
        }
        .content p {
          color: #4b5563;
          line-height: 1.6;
        }
        .otp { 
          font-size: 42px; 
          font-weight: bold; 
          color: #6366f1; 
          letter-spacing: 10px; 
          margin: 25px 0; 
          padding: 25px; 
          background: #f0f0ff; 
          border-radius: 12px;
          border: 2px dashed #6366f1;
        }
        .warning { 
          color: #f59e0b; 
          font-size: 14px; 
          margin-top: 20px;
          padding: 12px;
          background: #fffbeb;
          border-radius: 8px;
        }
        .footer { 
          background: #f9f9f9; 
          padding: 20px; 
          text-align: center; 
          color: #9ca3af; 
          font-size: 12px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Wahisnova</h1>
        </div>
        <div class="content">
          <h2>Verify Your Email</h2>
          <p>Hi ${name},</p>
          <p>Thank you for registering with Wahisnova. Use the code below to verify your email address:</p>
          <div class="otp">${otp}</div>
          <div class="warning">
            ⏰ This code will expire in 10 minutes.
          </div>
          <p style="margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Wahisnova. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Order Confirmation Email Template
export function getOrderConfirmationTemplate(
  name: string,
  orderId: string,
  productTitle: string,
  price: number
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .order-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .order-info p { margin: 8px 0; color: #374151; }
        .price { font-size: 24px; color: #6366f1; font-weight: bold; }
        .button { display: inline-block; padding: 12px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Your order has been confirmed. Thank you for your purchase!</p>
          <div class="order-info">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Product:</strong> ${productTitle}</p>
            <p><strong>Amount:</strong> <span class="price">$${price}</span></p>
          </div>
          <p>You can download your product from your orders page.</p>
          <a href="${process.env.NEXT_PUBLIC_API_URL}/orders" class="button">View My Orders</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Wahisnova. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Product Approved Email Template
export function getProductApprovedTemplate(
  name: string,
  productTitle: string,
  productId: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Product Approved!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Great news! Your product <strong>"${productTitle}"</strong> has been approved and is now live on Wahisnova.</p>
          <p>Customers can now discover and purchase your product.</p>
          <a href="${process.env.NEXT_PUBLIC_API_URL}/digital-products/${productId}" class="button">View Product</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Wahisnova. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Product Rejected Email Template
export function getProductRejectedTemplate(
  name: string,
  productTitle: string,
  reason: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .reason { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Product Review Update</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Unfortunately, your product <strong>"${productTitle}"</strong> was not approved.</p>
          <div class="reason">
            <strong>Reason:</strong> ${reason}
          </div>
          <p>Please fix the issues and resubmit your product.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Wahisnova. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}