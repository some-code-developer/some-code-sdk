// Documentation
// https://www.npmjs.com/package/xml-js

const convert = require('xml-js');
actionParameters.ExecutionResult = SUCCESS;
try {
  actionParameters.json = convert.xml2json(actionParameters.xml, { compact: true, spaces: 4 });
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;
