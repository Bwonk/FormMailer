const express = require('express');
const cors = require('cors');
const requestIp = require('request-ip');
require('dotenv').config();

const rateLimiter = require('./middleware/rate-limiter');
const contactController = require('./controllers/contact.controller');
const Logger = require('./utils/logger');

class Server {
    constructor() {
        this.app = express();
        this.logger = new Logger();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandlers();
    }

    setupMiddleware() {
        this.app.use(cors({
            origin: '*',
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type']
        }));
        this.app.use(express.json());
        this.app.use(express.static('public'));
        this.app.use(requestIp.mw());
    }

    setupRoutes() {
        this.app.use('/send-email', rateLimiter);
        this.app.post('/send-email', (req, res) => contactController.handleContactForm(req, res));
    }

    setupErrorHandlers() {
        process.on('unhandledRejection', (error) => {
            this.logger.logError(error, { type: 'unhandledRejection' });
        });

        process.on('uncaughtException', (error) => {
            this.logger.logError(error, { type: 'uncaughtException' });
            process.exit(1);
        });
    }

    start() {
        const PORT = process.env.PORT || 3000;
        this.app.listen(PORT, () => {
            console.log(`Server ${PORT} portunda çalışıyor - http://localhost:${PORT}`);
        });
    }
}

const server = new Server();
server.start(); 