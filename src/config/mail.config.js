const nodemailer = require('nodemailer');
require('dotenv').config();

const mailConfig = {
    createTransporter: () => {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
};

module.exports = mailConfig; 