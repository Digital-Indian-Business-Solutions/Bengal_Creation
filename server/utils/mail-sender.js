require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // or 587
    secure: true, // true for 465, false for 587
    auth: {
        user: process.env.EMAIL_USER, // your GoDaddy email
        pass: process.env.EMAIL_PASS, // your GoDaddy password
    },
});

const sendEmail = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: `Bengal Creations <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${to} (Message ID: ${info.messageId})`);
        return info;
    } catch (error) {
        console.error(`❌ Error sending email to ${to}:`, error.message);
        throw error;
    }
};

module.exports = sendEmail;