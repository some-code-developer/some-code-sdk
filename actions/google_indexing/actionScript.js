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

  const b = {
    url: actionParameters.url,
    type: actionParameters.type,
  };

  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens.access_token}`,
    },
    body: JSON.stringify(b),
  };

  const response = await fetch(url, request);
  rsp = await response.json();
  actionParameters.responseBody = JSON.stringify(rsp, null, 4);
  if (rsp.error) throw new Error(rsp.error.message); 
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
