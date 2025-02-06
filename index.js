require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Email transporter
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
        console.error('Email Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Unable to submit form. Please try again.' 
        });
    }
});

// Export the Express API
module.exports = app;
