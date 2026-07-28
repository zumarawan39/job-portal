import nodemailer from "nodemailer";

// Sends an email using SMTP settings from .env. If email isn't configured yet,
// it just logs a warning instead of crashing - so the app keeps working even
// without SMTP set up (handy for a beginner who hasn't configured email yet).
const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("Email not sent (EMAIL_USER/EMAIL_PASS not configured in .env) - would have sent to " + to);
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "smtp.gmail.com",
            port: process.env.EMAIL_PORT || 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to,
            subject,
            html
        });
    } catch (error) {
        console.log(error);
    }
}

export default sendEmail;
