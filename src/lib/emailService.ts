/**
 * Simulated Email Service
 * 
 * In a real application, this would call an API (like Resend, SendGrid) 
 * or a Supabase Edge Function to send actual emails.
 * 
 * For this demo, we fake the delay and log to console.
 */

export const sendEmail = async ({ to, subject, body }: { to: string, subject: string, body: string }) => {
    console.log(`[Email Service] Sending email to: ${to}`)
    console.log(`[Email Service] Subject: ${subject}`)
    console.log(`[Email Service] Body: ${body}`)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    return true
}
