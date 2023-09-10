const fs = require("fs");

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

actionParameters.ExecutionResult = SUCCESS;
try {
  const file = cleanPath(actionParameters.file);
  fs.writeFileSync(file, workflowVariables[actionParameters.variable]);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
