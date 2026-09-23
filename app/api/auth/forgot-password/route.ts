// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const user = await (User as any).findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    // Security: Don't reveal if email exists
    if (!user) {
      return NextResponse.json(
        { success: true, message: 'If email exists, reset link has been sent' },
        { status: 200 }
      );
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();
    
    // Reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_API_URL}/reset-password/${resetToken}`;
    
    // Send email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; text-align: center; }
          .button { display: inline-block; padding: 14px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .warning { color: #f59e0b; font-size: 13px; margin-top: 15px; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Password</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p class="warning">⏰ This link will expire in 1 hour.</p>
            <p style="font-size: 12px; color: #6b7280;">If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Wahisnova</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password - Wahisnova',
      html: emailHtml
    });
    
    return NextResponse.json(
      { success: true, message: 'Reset link sent to your email' },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send reset link' },
      { status: 500 }
    );
  }
}