const fs = require("fs");
const fetch = require("node-fetch");
const util = require("util");
const streamPipeline = util.promisify(require("stream").pipeline);

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

actionParameters.ExecutionResult = SUCCESS;
try {
  const request = { method: actionParameters.method };

  let url = actionParameters.url;
  if (actionParameters.addQuery == "true") url = url + "?" + actionParameters.query;
  if (actionParameters.addHeader == "true") request.header = actionParameters.header;
  if (actionParameters.addBody == "true") request.body = actionParameters.body;

  const response = await fetch(url, request);
  actionParameters.responseStatus = response.status;
  actionParameters.responseStatusText = response.statusText;
  if (response.status !== 200) throw new Error(response.statusText);

  actionParameters.responseHeaders = response.headers;

  if (actionParameters.responseFileSave == "true") {
    const file = cleanPath(actionParameters.responseFile);
    if (actionParameters.responseType === "JSON") await streamPipeline(JSON.stringify(response.body), fs.createWriteStream(file));
    if (actionParameters.responseType === "TEXT") await streamPipeline(response.text(), fs.createWriteStream(file));
    if (actionParameters.responseType === "BINARY") await streamPipeline(response.body, fs.createWriteStream(file));
  } else {
    if (actionParameters.responseType === "JSON") actionParameters.responseBody = JSON.stringify(response.body);
    if (actionParameters.responseType === "TEXT") actionParameters.responseBody = await response.text();
    if (actionParameters.responseType === "BINARY") actionParameters.responseBody = await response.body;
  }
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
