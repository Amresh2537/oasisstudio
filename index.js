require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Thank you routes for different form types
app.get("/thank-you", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "thank-you.html"));
});

app.get("/thank-you/getquote", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "thank-you.html"));
});

app.get("/thank-you/getintouch", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "thank-you.html"));
});

app.get("/thank-you/enquirynow", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "thank-you.html"));
});

// Environment variable validation
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECIPIENT_EMAIL) {
    console.error("❌ Missing required environment variables");
    process.exit(1);
}

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Form submission handler
app.post('/submit-form', async (req, res) => {
    try {
        const { name, phone, comment, formType } = req.body;
        
        if (!name || !phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name and phone are required' 
            });
        }

        // Determine email subject based on form type
        let emailSubject = 'New Kitchen Inquiry';
        let redirectUrl = '/thank-you';
        
        if (formType === 'quote') {
            emailSubject = 'New Quote Request';
            redirectUrl = '/thank-you/getquote';
        } else if (formType === 'contact') {
            emailSubject = 'New Contact Request';
            redirectUrl = '/thank-you/getintouch';
        } else if (formType === 'enquiry') {
            emailSubject = 'New Enquiry';
            redirectUrl = '/thank-you/enquirynow';
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECIPIENT_EMAIL,
            subject: emailSubject,
            html: `
                <h2>${emailSubject}</h2>
                <p><strong>Form Type:</strong> ${formType || 'Not specified'}</p>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Comment:</strong> ${comment || 'No comment provided'}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ 
            success: true, 
            message: 'Thank you! We will contact you soon.',
            redirect: redirectUrl
        });
    } catch (error) {
        console.error('❌ Email Error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to submit form. Please try again later.'
        });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

module.exports = app;