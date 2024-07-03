const path = require("node:path");
const fs = require("fs");
const vm = require("node:vm");
const winston = require("winston");

const { createLogger } = require("winston");
const { screenFormat } = require("./winstonFormats");

const { ERROR, SUCCESS, RUNNING, LOOP_END, NOT_STARTED } = require("./consts");

const createWorkflowLogger = (level) => {
  const transportsArray = [
    new winston.transports.Console({
      handleExceptions: false,
      format: screenFormat,
    }),
  ];

  if (process.env.NODE_ENV === "test" && level !== "debug") {
    transportsArray[0].silent = true;
  }

  return createLogger({
    level,
    transports: transportsArray,
    exitOnError: false,
  });
};

const getCode = (code) => `(async function ()  { ${code}  })()`;

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 4));
}

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file));
}

function getActionScript(actionCode) {
  return fs.readFileSync(path.resolve("./actions", actionCode, "actionScript.js"));
}

const executeAction = async (actionToExecute, actionParameters, workflowVariables, level = "debug") => {
  // Init variables and const's

  let workflowParameters = {};
  let executionResult = SUCCESS;

  const executionFolder = path.resolve("./executions", actionToExecute);

  // Folder where action execution info is stored
  const actionExecutionInfoFolder = path.resolve(executionFolder, "actions-execution-info");

  // Creating logger
  const logger = createWorkflowLogger(level);

  const stepExecutionInfo = {
    action: actionToExecute,
    status: RUNNING,
    message: "",
    start: new Date().toISOString(),
  };

  // Loop helpers
  const actionLoopInfoFile = path.resolve(actionExecutionInfoFolder, `${actionToExecute}_loop.json`);

  const getLoopInfo = async () => {
    let loopInfo;
    await fs.mkdirSync(actionExecutionInfoFolder, { recursive: true });
    if (fs.existsSync(actionLoopInfoFile)) loopInfo = readJSON(actionLoopInfoFile);
    else loopInfo = { loopStatus: NOT_STARTED, loopIndex: 0 };
    return loopInfo;
  };

  const updateLoopInfo = (loopIndex) => {
    writeJSON(actionLoopInfoFile, {
      loopStatus: RUNNING,
      loopIndex,
    });
  };

  const resetLoopInfo = async () => {
    if (fs.existsSync(actionLoopInfoFile)) fs.unlinkSync(actionLoopInfoFile);
  };

  // Logging object info
  lo = (o) => {
    for (const key in o) {
      if (key === "password") logger.debug(`${key}: ******`);
      else if (typeof o[key] === "object") {
        // connection
        lo(o[key]);
      } else logger.debug(`${key}: ${o[key]}`);
    }
  };

  logObject = (o, title) => {
    let hasData = false;
    for (const key in o)
      if (o[key]) {
        hasData = true;
        break;
      }

    if (hasData) {
      logger.debug(title);
      lo(o);
    }
  };

  try {
    logger.debug(`Executing Action: ${actionToExecute}`);

    logObject(actionParameters, "Action Parameters:");

    let actionCode = getActionScript(actionToExecute);

    // Actual execution
    const context = {
      require,
      getLoopInfo,
      updateLoopInfo,
      resetLoopInfo,
      workflowCode: "workflowCode",
      workflowParameters,
      actionParameters,
      workflowVariables,
      stepExecutionInfo,
      logger: logger,
      ERROR,
      SUCCESS,
      RUNNING,
      LOOP_END,
      isPaused: false,
    };
    vm.createContext(context); // Contextify the object.
    executionResult = await vm.runInNewContext(getCode(actionCode), context);

    logObject(workflowVariables, "Variables:");
  } catch (e) {
    logger.info(e.message);
    logger.info(e.stack.replace(e.message, ""));
    executionResult = ERROR;
  }

  logger.debug(`Execution Result: ${executionResult}`);

  return executionResult;
};

module.exports = executeAction;
