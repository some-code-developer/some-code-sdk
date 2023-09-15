const path = require('node:path');
const fs = require('fs');
const vm = require('node:vm');
const winston = require('winston');

const { createLogger } = require('winston');
const { screenFormat } = require('./winstonFormats');

const { ERROR, SUCCESS } = require('./consts');

const createWorkflowLogger = (level) => {
  const transportsArray = [
    new winston.transports.Console({
      handleExceptions: false,
      format: screenFormat,
    }),
  ];

  if (process.env.NODE_ENV === 'test' && level !== 'debug') {
    transportsArray[0].silent = true;
  }

  return createLogger({
    level,
    transports: transportsArray,
    exitOnError: false,
  });
};

const getCode = (code) => `(async function ()  { ${code}  })()`;

function getValidationScript(actionCode) {
  return fs.readFileSync(path.resolve('./connections', actionCode, 'validationScript.js'));
}

const executeConnectionValidationScript = async (connectionToTest, connectionParameters, level = 'info') => {
  // Init variables and const's

  let executionResult = SUCCESS;

  // Creating logger
  const logger = createWorkflowLogger(level);

  try {
    logger.debug(`Testing Connection Validation Script: ${connectionToTest}`);

    let connectionTestCode = getValidationScript(connectionToTest);

    // Actual execution
    const context = { require, connectionParameters, ERROR, SUCCESS };
    vm.createContext(context); // Contextify the object.
    executionResult = await vm.runInNewContext(getCode(connectionTestCode), context);
  } catch (e) {
    logger.info(e.message);
    logger.info(e.stack.replace(e.message, ''));
    executionResult = ERROR;
  }

  logger.debug(`Execution Result: ${executionResult.status}`);

  return executionResult.status;
};

module.exports = executeConnectionValidationScript;
