const winston = require('winston');

const screenFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  winston.format.align(),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

module.exports = { screenFormat };
