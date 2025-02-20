class Logger {
    logError(error, details) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack,
            details: details
        };
        console.error('Mail Error Log:', JSON.stringify(errorLog, null, 2));
    }
}

module.exports = Logger; 