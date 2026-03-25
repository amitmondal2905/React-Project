'use server'

import nodemailer from 'nodemailer'

interface SendEmailParams {
    to: string;
    candidateName: string;
    jobTitle: string;
}

export async function sendRejectionEmail({ to, candidateName, jobTitle }: SendEmailParams) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('SMTP credentials are not configured in environment variables.');
        return { success: false, error: 'SMTP credentials missing. Please configure SMTP_USER and SMTP_PASS in .env.local' };
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can change this to your specific SMTP host/port later if not using Gmail
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const subject = `Update regarding your application for ${jobTitle}`;
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <p>Dear ${candidateName},</p>
                <p>Thank you for taking the time to apply for the <strong>${jobTitle}</strong> position.</p>
                <p>We appreciate your interest in joining our team and the time you invested in the application process. After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match the specific requirements for this role at this time.</p>
                <p>We will keep your resume on file for future opportunities and will reach out if a suitable position becomes available.</p>
                <p>We wish you the best of luck in your job search and your future professional endeavors.</p>
                <br />
                <p>Best regards,</p>
                <p><strong>The Recruitment Team</strong></p>
            </div>
        `;

        const info = await transporter.sendMail({
            from: `"The Recruitment Team" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}


export async function sendHiredEmail({ to, candidateName, jobTitle }: SendEmailParams) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return { success: false, error: 'SMTP credentials missing' };
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const subject = `Offer Letter: Welcome to the team as our new ${jobTitle}!`;
        // IMPORTANT: Change YOUR_WEBSITE_URL below to your actual domain in production (e.g. https://my-hr-app.vercel.app/signup)
        const signupLink = process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/signup` : `http://localhost:3000/signup`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4F46E5;">Congratulations, ${candidateName}! 🎉</h2>
                <p>We are thrilled to officially offer you the position of <strong>${jobTitle}</strong>.</p>
                <p>To get started and access your new employee dashboard, you need to create your internal account.</p>
                <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin-top: 0;"><strong>CRITICAL REGISTRATION STEP:</strong></p>
                    <p>You MUST sign up using this exact email address (<strong>${to}</strong>) so that the system correctly links your application to your new employee profile.</p>
                </div>
                <a href="${signupLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Create Your Account Here</a>
                <br /><br />
                <p>Welcome aboard!</p>
                <p><strong>The HR Team</strong></p>
            </div>
        `;

        const info = await transporter.sendMail({
            from: `"The HR Team" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
