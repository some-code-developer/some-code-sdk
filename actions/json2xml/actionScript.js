// Documentation
// https://www.npmjs.com/package/xml-js

const convert = require('xml-js');
actionParameters.ExecutionResult = SUCCESS;
try {
  if (!actionParameters.json) throw new Error('Missing JSON');
  actionParameters.xml = convert.json2xml(actionParameters.json, { compact: true, spaces: 4 });
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
