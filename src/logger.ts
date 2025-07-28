import logger from 'pino'

const log = logger({
    transport: process.env.NODE_ENV === 'production' ? {
        target: 'pino-pretty', options: {
            colorize: true,
            levelFirst: true,
            translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
            ignore: "pid,hostname",
        }
    } : {
        target: 'pino-pretty', options: {
            colorize: true,
            levelFirst: true,
            translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
            ignore: "pid,hostname",
        }
    },
    level: "info"
});

export default log;