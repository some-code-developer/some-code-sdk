const { Xslt, xmlParse } = require("xslt-processor");

// Very limited functionality
// Better to replace it something else in the future

actionParameters.ExecutionResult = SUCCESS;
try {
  const xslt = new Xslt();
  actionParameters.result = xslt.xsltProcess(xmlParse(actionParameters.xml), xmlParse(actionParameters.xslt));
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
