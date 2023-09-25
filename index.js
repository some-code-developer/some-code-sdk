// Demonstrates running single action and restoring it

const executeAction = require('./utils/action_execute.js');
const restore = require('./utils/action_restore.js');

const ExcelJS = require('exceljs');
const fileName = '/home/dbsl/NODE/some-code/backend/data/files/Excel/Google Ads Optimisation Checklist.xlsx';

const workbook = new ExcelJS.Workbook();
workbook.xlsx.readFile(fileName).then((workbook) => {
  const worksheet = workbook.getWorksheet('Onboarding');
  let rows = worksheet.getRows(0, worksheet.lastRow.number);
  rows = rows.map((row) => row.values);
});

// const workflowVariables = {};

// const action = 'apachekafka_send_message';

// const actionParameters = {
//   connection: { host: process.env.KAFKA_HOST, port: process.env.KAFKA_PORT },
//   keyedMessage: false,
//   key: 'key',
//   message: 'message',
//   topic: 'some-topic',
// };

// executeAction(action, actionParameters, workflowVariables);

//restore(action);
