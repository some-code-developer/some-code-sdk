const { OpenAI } = require('openai');
actionParameters.ExecutionResult = SUCCESS;
try {
  const openai = new OpenAI({
    apiKey: actionParameters.connection.password,
  });

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: actionParameters.prompt }],
    model: actionParameters.model,
  });

  actionParameters.completion = chatCompletion.choices[0].text;
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
