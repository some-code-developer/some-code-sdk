// Documentation
// https://googleapis.dev/nodejs/googleapis/latest/docs/

const { google } = require('googleapis');

var result = { status: SUCCESS, message: 'Success' };

try {
  const client = new google.auth.JWT(
    connectionParameters.email,
    null,
    connectionParameters.password.split('\\n').join('\n'),
    ['https://www.googleapis.com/auth/indexing'],
    null
  );
  await client.authorize();
} catch (e) {
  result.status = ERROR;
  result.message = e.message;
}
return result;
