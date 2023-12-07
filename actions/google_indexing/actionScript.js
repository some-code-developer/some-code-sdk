// Documentation
// https://googleapis.dev/nodejs/googleapis/latest/docs/

const fetch = require('node-fetch');
const { google } = require('googleapis');

actionParameters.ExecutionResult = SUCCESS;
try {
  const client = new google.auth.JWT(
    actionParameters.connection.email,
    null,
    actionParameters.connection.password.split('\\n').join('\n'),
    ['https://www.googleapis.com/auth/indexing'],
    null
  );
  const tokens = await client.authorize();

  const url = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

  const request = {
    method: 'POST',
    // Your options, which must include the Content-Type and auth headers
    headers: {
      'Content-Type': 'application/json',
    },
    auth: { bearer: tokens.access_token },
    // Define contents here. The structure of the content is described in the next step.
    json: {
      url: actionParameters.url,
      type: actionParameters.type,
    },
  };

  const response = await fetch(url, request);
  actionParameters.responseBody = JSON.stringify(response.body);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
