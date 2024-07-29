// Documentation
// https://www.npmjs.com/package/cheerio

const cheerio = require('cheerio');

function extractUniqueUrlsFromHtml(htmlString, baseUrl) {
  const urlsSet = new Set();

  // Load the HTML string into a Cheerio instance
  const $ = cheerio.load(htmlString);

  // Find all anchor elements (a) with href attribute
  const anchorElements = $('a[href]');

  // Extract and add valid, unique URLs to the Set
  anchorElements.each((index, element) => {
    const href = $(element).attr('href');
    if (href) {
      // If the URL starts with "/", prepend the base URL
      const completeUrl = href.startsWith('/') ? `${baseUrl}${href}` : href;

      urlsSet.add(completeUrl);
    }
  });

  return Array.from(urlsSet);
}

actionParameters.ExecutionResult = SUCCESS;
try {
  actionParameters.urls = extractUniqueUrlsFromHtml(actionParameters.html, actionParameters.baseUrl);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;
