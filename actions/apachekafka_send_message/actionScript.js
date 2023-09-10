const kafka = require("kafka-node");

// TO DO
// Investigate switching to more modern library (kafkajs)
// Extend functionality

// Documentation
// https://www.npmjs.com/package/kafka-node

actionParameters.ExecutionResult = SUCCESS;

const sendMessage = async () => {
  const p = new Promise((resolve, reject) => {
    const connectionOptions = {
      kafkaHost: `${actionParameters.connection.host}:${actionParameters.connection.port}`,
      reconnectOnIdle: false,
    };

    const kafkaClient = new kafka.KafkaClient(connectionOptions);
    const Producer = kafka.Producer;
    const KeyedMessage = kafka.KeyedMessage;
    const producer = new Producer(kafkaClient);

    const messages = [];

    if (actionParameters.keyedMessage == "true") messages.push(new KeyedMessage(actionParameters.key, actionParameters.message));
    else messages.push(actionParameters.message);

    const message = {
      topic: actionParameters.topic,
      messages,
      partition: actionParameters.partition,
      attributes: actionParameters.attributes,
      timestamp: Date.now(),
    };

    if (actionParameters.partitionKey) message.key = actionParameters.partitionKey;

    const onError = (err) => reject(err);

    const onReady = async () => {
      logger.debug("Kafka - Ready");
      producer.send([message], function (err, data) {
        if (err) return reject(err);
        logger.debug("Message Sent");
        actionParameters.response = data;
        resolve();
      });
    };
    producer.on("ready", onReady);
    producer.on("error", onError);
  });

  return p;
};

try {
  await sendMessage();
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}

return actionParameters.ExecutionResult;
