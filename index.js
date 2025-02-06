require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000; // Fallback for local testing

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve index.html as root
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Ensure environment variables are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECIPIENT_EMAIL) {
    console.error("❌ Missing EMAIL_USER, EMAIL_PASS, or RECIPIENT_EMAIL in .env file");
    process.exit(1); // Stop the server if env variables are missing
}

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Form submission endpoint
app.post('/submit-form', async (req, res) => {
    try {
        const { name, phone, email, address, comment } = req.body;

        if (!name || !phone || !email || !address) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL,
            subject: 'New Kitchen Inquiry',
            html: `
                <h2>New Kitchen Inquiry</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Address:</strong> ${address}</p>
                <p><strong>Comment:</strong> ${comment}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Thank you! We will contact you soon.' });
    } catch (error) {
        console.error('❌ Email Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Unable to submit form. Please try again later.' 
        });
    }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// Export the Express API (for Vercel)
module.exports = app;
