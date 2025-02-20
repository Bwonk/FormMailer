const mailConfig = require('../config/mail.config');
const Logger = require('../utils/logger');

class MailService {
    constructor() {
        this.transporter = mailConfig.createTransporter();
        this.logger = new Logger();
    }

    async sendContactMail({ name, email, subject, message, clientIp }) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Yeni İletişim Formu: ${subject}`,
            html: this._createEmailTemplate({ name, email, subject, message, clientIp }),
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High'
            }
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return { success: true, message: 'E-posta başarıyla gönderildi' };
        } catch (error) {
            this.logger.logError(error, { email, subject });
            throw new Error('E-posta gönderilirken bir hata oluştu');
        }
    }

    _createEmailTemplate({ name, email, subject, message, clientIp }) {
        return `
            <h3>Yeni İletişim Formu Mesajı</h3>
            <p><strong>Gönderen:</strong> ${name}</p>
            <p><strong>E-posta:</strong> ${email}</p>
            <p><strong>Konu:</strong> ${subject}</p>
            <p><strong>Mesaj:</strong></p>
            <p>${message}</p>
            <p><strong>IP Adresi:</strong> ${clientIp}</p>
            <p><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</p>
        `;
    }
}

module.exports = new MailService(); 