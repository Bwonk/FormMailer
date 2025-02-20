const mailService = require('../services/mail.service');
const contactValidator = require('../validators/contact.validator');
const Logger = require('../utils/logger');

class ContactController {
    constructor() {
        this.logger = new Logger();
    }

    async handleContactForm(req, res) {
        try {
            const validationResult = contactValidator.validate(req.body);
            
            if (!validationResult.isValid) {
                return res.status(400).json(validationResult.errors);
            }

            const { name, email, subject, message } = req.body;
            const result = await mailService.sendContactMail({
                name,
                email,
                subject,
                message,
                clientIp: req.clientIp
            });

            res.status(200).json(result);
        } catch (error) {
            this.logger.logError(error, { path: '/send-email', body: req.body });
            res.status(500).json({
                error: 'Beklenmeyen bir hata oluştu',
                details: 'Sistem yöneticisi bilgilendirildi'
            });
        }
    }
}

module.exports = new ContactController(); 