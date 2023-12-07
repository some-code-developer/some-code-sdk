// Documentation
// https://www.npmjs.com/package/openai

const { OpenAI } = require('openai');

var result = { status: SUCCESS, message: 'Success' };

try {
  const client = new OpenAI({ apiKey: connectionParameters.password });
  await client.models.list();
} catch (e) {
  result.status = ERROR;
  result.message = e.message;
}
return result;
