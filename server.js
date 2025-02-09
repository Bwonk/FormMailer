const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const requestIp = require('request-ip');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.static('public'));
app.use(requestIp.mw());

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
        error: 'Rate limit aşıldı',
        details: 'Çok fazla istek gönderdiniz. Lütfen 1 saat sonra tekrar deneyin.',
        remainingTime: 'windowMs'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'İstek limiti aşıldı',
            details: 'Çok fazla deneme yaptınız. Lütfen bir süre bekleyin.',
            retryAfter: res.getHeader('Retry-After')
        });
    }
});

app.use('/send-email', limiter);

const spamWords = ['casino', 'lottery', 'viagra', 'xxx', 'win money'];

function containsSpamWords(text) {
    return spamWords.some(word => text.toLowerCase().includes(word.toLowerCase()));
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function logError(error, details) {
    const errorLog = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        details: details
    };
    console.error('Mail Error Log:', JSON.stringify(errorLog, null, 2));
}

app.post('/send-email', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                error: 'Tüm alanları doldurunuz',
                fields: {
                    name: !name ? 'Ad alanı gerekli' : null,
                    email: !email ? 'Email alanı gerekli' : null,
                    subject: !subject ? 'Konu alanı gerekli' : null,
                    message: !message ? 'Mesaj alanı gerekli' : null
                }
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Geçersiz email formatı',
                field: 'email'
            });
        }

        if (containsSpamWords(message) || containsSpamWords(subject)) {
            logError(new Error('Spam attempt'), { email, subject, message });
            return res.status(400).json({ 
                error: 'Spam içerik tespit edildi',
                details: 'Mesajınız spam filtresine takıldı'
            });
        }

        if (message.length < 10) {
            return res.status(400).json({ 
                error: 'Mesaj çok kısa',
                field: 'message',
                minLength: 10
            });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Yeni İletişim Formu: ${subject}`,
            html: `
                <h3>Yeni İletişim Formu Mesajı</h3>
                <p><strong>Gönderen:</strong> ${name}</p>
                <p><strong>E-posta:</strong> ${email}</p>
                <p><strong>Konu:</strong> ${subject}</p>
                <p><strong>Mesaj:</strong></p>
                <p>${message}</p>
                <p><strong>IP Adresi:</strong> ${req.clientIp}</p>
                <p><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</p>
            `,
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High'
            }
        };

        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ 
                message: 'E-posta başarıyla gönderildi',
                success: true
            });
        } catch (mailError) {
            logError(mailError, { 
                email, 
                subject,
                errorCode: mailError.code,
                errorResponse: mailError.response
            });
            res.status(500).json({ 
                error: 'E-posta gönderilirken bir hata oluştu',
                details: 'Lütfen daha sonra tekrar deneyiniz',
                errorCode: mailError.code
            });
        }
    } catch (error) {
        logError(error, { path: '/send-email', body: req.body });
        res.status(500).json({ 
            error: 'Beklenmeyen bir hata oluştu',
            details: 'Sistem yöneticisi bilgilendirildi'
        });
    }
});

process.on('unhandledRejection', (error) => {
    logError(error, { type: 'unhandledRejection' });
});

process.on('uncaughtException', (error) => {
    logError(error, { type: 'uncaughtException' });
    process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor - http://localhost:${PORT}`);
}); 