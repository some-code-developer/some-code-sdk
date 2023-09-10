const convert = require("xml-js");
actionParameters.ExecutionResult = SUCCESS;
try {
  actionParameters.xml = convert.json2xml(actionParameters.json, { compact: true, spaces: 4 });
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
