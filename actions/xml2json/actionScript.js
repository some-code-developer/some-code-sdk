const convert = require("xml-js");
actionParameters.ExecutionResult = SUCCESS;
try {
  actionParameters.json = convert.xml2json(actionParameters.xml, { compact: true, spaces: 4 });
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
