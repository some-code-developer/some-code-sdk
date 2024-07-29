// Documentation
// https://www.npmjs.com/package/xml-js

const xmljs = require('xml-js');

function extractUrlsFromSitemap(xmlString) {
  const urlsSet = new Set();

  // Parse the XML string
  const result = xmljs.xml2js(xmlString, { compact: true });

  // Extract URLs from the parsed XML and add them to the Set
  if (result.urlset && result.urlset.url) {
    const urlArray = Array.isArray(result.urlset.url) ? result.urlset.url : [result.urlset.url];
    urlArray.forEach((url) => {
      const urlString = url.loc._text;
      urlsSet.add(urlString);
    });
  }
  return Array.from(urlsSet);
}

actionParameters.ExecutionResult = SUCCESS;
try {
  actionParameters.urls = extractUrlsFromSitemap(actionParameters.sitemap);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;
