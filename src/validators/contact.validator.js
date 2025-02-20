class ContactValidator {
    static spamWords = ['casino', 'lottery', 'viagra', 'xxx', 'win money'];

    validate(data) {
        const errors = this._validateRequiredFields(data);
        if (Object.keys(errors).length > 0) {
            return {
                isValid: false,
                errors: {
                    error: 'Tüm alanları doldurunuz',
                    fields: errors
                }
            };
        }

        if (!this._isValidEmail(data.email)) {
            return {
                isValid: false,
                errors: {
                    error: 'Geçersiz email formatı',
                    field: 'email'
                }
            };
        }

        if (this._containsSpamWords(data.message) || this._containsSpamWords(data.subject)) {
            return {
                isValid: false,
                errors: {
                    error: 'Spam içerik tespit edildi',
                    details: 'Mesajınız spam filtresine takıldı'
                }
            };
        }

        if (data.message.length < 10) {
            return {
                isValid: false,
                errors: {
                    error: 'Mesaj çok kısa',
                    field: 'message',
                    minLength: 10
                }
            };
        }

        return { isValid: true };
    }

    _validateRequiredFields({ name, email, subject, message }) {
        const errors = {};
        if (!name) errors.name = 'Ad alanı gerekli';
        if (!email) errors.email = 'Email alanı gerekli';
        if (!subject) errors.subject = 'Konu alanı gerekli';
        if (!message) errors.message = 'Mesaj alanı gerekli';
        return errors;
    }

    _isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    _containsSpamWords(text) {
        return ContactValidator.spamWords.some(word => 
            text.toLowerCase().includes(word.toLowerCase())
        );
    }
}

module.exports = new ContactValidator(); 