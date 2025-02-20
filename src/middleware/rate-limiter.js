const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
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

module.exports = rateLimiter; 