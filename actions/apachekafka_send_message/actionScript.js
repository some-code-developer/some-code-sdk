const { Kafka, logLevel } = require('kafkajs');

// TO DO
// Extend functionality

// Documentation
// https://www.npmjs.com/package/kafkajs

actionParameters.ExecutionResult = SUCCESS;

try {
  const kafka = new Kafka({
    clientId: 'some-code-producer',
    brokers: [`${actionParameters.connection.host}:${actionParameters.connection.port}`],
    logLevel: logLevel.NOTHING,
  });

  const producer = kafka.producer();
  await producer.connect();

  const messages = [];

  if (actionParameters.keyedMessage === true || actionParameters.keyedMessage === 'true')
    messages.push({ key: actionParameters.key, value: actionParameters.message });
  else messages.push({ value: actionParameters.message });

  const message = {
    topic: actionParameters.topic,
    messages,
  };

  await producer.send(message);

  await producer.disconnect();
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}

return actionParameters.ExecutionResult;
