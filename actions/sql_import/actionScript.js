// Documentation
// https://typeorm.io/

// mappingType: "0" Not Mapped
// mappingType: "1" Mapped to Field
// mappingType: "2" Mapped to Variable

const typeorm = require("typeorm");
const sql = require("mssql");
const { Buffer } = require("node:buffer");
const fs = require("fs");
const readline = require("readline");
const dayjs = require("dayjs");
const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss.SSS";

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath, secondsToHMS, getFieldsSql, getSplitStringFunction } = require("./utils");

actionParameters.ExecutionResult = SUCCESS;

const startDate = new Date();
let totalRecords = 0;
let linesRead = 0;
let mapping = [];
let totalSize = 0;
let bytesRead = 0;
let sourceFile;
let splitFunction;
let lastPercentageRead = 0;
let linesToSkip = 0;
let maxLinesToRead = 0;

// Assigning split function

splitFunction = getSplitStringFunction(
  actionParameters.sourceFormat === "Delimited",
  actionParameters.sourceDelimiter,
  actionParameters.sourceQuote,
  actionParameters.mapping.fieldWidths
);

function printProgress(line) {
  bytesRead += Buffer.from(line).length;
  const percentageRead = (bytesRead / totalSize) * 100;
  // Print every 10 percent
  if (Math.floor(percentageRead) % 10 === 0 && Math.floor(percentageRead) > lastPercentageRead) {
    logger.debug(`Percentage read: ${percentageRead.toFixed(2)}%`);
    lastPercentageRead = Math.floor(percentageRead);
  }
}

function getTableColumns(fields) {
  return fields.map((row, i) => {
    const item = {
      no: i,
      name: row.field,
      type: row.data_type,
      mappingType: "0",
      sourceFieldId: -1,
    };
    if (actionParameters.mapping && actionParameters.mapping.mapping && actionParameters.mapping.mapping[i]) {
      item.mappingType = actionParameters.mapping.mapping[i].mappingType;
      item.fieldName = actionParameters.mapping.mapping[i].fieldName;
      item.dateFormat = actionParameters.mapping.mapping[i].dateFormat;
      item.variable = actionParameters.mapping.mapping[i].variable;
    }
    if (item.mappingType === "1") {
      // Mapped to source field
      item.sourceFieldId = actionParameters.mapping.fieldNames.indexOf(item.fieldName);
      if (item.sourceFieldId === -1) logger.debug(`Warning source field ${item.fieldName} is missing`);
    }
    return item;
  });
}

async function importTypeORM() {
  let tableColumns = [];
  let parameters = [];
  let fieldNames = [];
  const dataRow = [];

  const connection = {
    name: "sql_import",
    type: actionParameters.targetConnection.type,
    host: actionParameters.targetConnection.host,
    port: Number(actionParameters.targetConnection.port),
    username: actionParameters.targetConnection.username,
    password: actionParameters.targetConnection.password,
    database: actionParameters.targetConnection.database,
    options: {
      instanceName: actionParameters.targetConnection.instanceName,
      encrypt: false, // Use this if you're on Windows Azure
    },
  };

  const dataSource = new typeorm.DataSource(connection);

  // Testing connection
  await dataSource.initialize();

  const fieldsQuery = getFieldsSql(actionParameters.targetConnection.type, actionParameters.targetTable);

  const fields = await dataSource.query(fieldsQuery);

  tableColumns = getTableColumns(fields);

  // Populating mapping array
  mapping = tableColumns
    .filter((item1) => item1.mappingType !== "0") // Mapped to field or variable
    .map((item2, no) => {
      // Adding no
      return { ...item2, no };
    })
    .filter((item3) => item3.mappingType === "1") // Mapped to field
    .map((item4) => {
      return { no: item4.no, sourceFieldId: item4.sourceFieldId };
    });

  // Generating insert statement only for mapped fields (mappingType !== "0")

  // 1 List of fields
  if (actionParameters.targetConnection.type === "mysql")
    fieldNames = tableColumns.filter((item1) => item1.mappingType !== "0").map((item2) => "`" + item2.name + "`");
  else fieldNames = tableColumns.filter((item1) => item1.mappingType !== "0").map((item2) => `"${item2.name}"`);

  // 2 List of parameters
  if (actionParameters.targetConnection.type === "postgres") parameters = fieldNames.map((field, i) => `$${i + 1}`);
  else parameters = fieldNames.map((field) => "?");

  // TO DO: Test with oracle

  if (fieldNames.length === 0) throw new Error(`No Field names`);

  const insertSQL = `INSERT INTO ${actionParameters.targetTable} (${fieldNames.join(",")}) VALUES (${parameters.join(",")}) `;

  //logger.error(insertSQL);

  dataRow.length = fieldNames.length;

  // Assigning variables values

  tableColumns
    .filter((item1) => item1.mappingType !== "0") // Mapped to field or variable
    .map((item2, no) => {
      // Adding no
      return { ...item2, no };
    })
    .filter((item3) => item3.mappingType === "2") // Mapped to variable
    .forEach((item4) => {
      dataRow[item4.no] = workflowVariables[item4.variable] ? workflowVariables[item4.variable] : workflowParameters[item4.variable];
    });

  // Populating date formats array

  dateFormats = tableColumns
    .filter((item1) => item1.mappingType !== "0") // Mapped to field or variable
    .map((item2, no) => {
      // Adding no
      return { ...item2, no };
    })
    .filter((item3) => item3.dateFormat) // Has date format
    .map((item4) => {
      return { no: item4.no, dateFormat: item4.dateFormat };
    });

  // logger.error(JSON.stringify(dateFormats, null, 4));
  // logger.error(JSON.stringify(tableColumns, null, 4));
  // logger.error(JSON.stringify(dataRow, null, 4));
  // logger.debug(insertSQL);

  const rl = readline.createInterface({
    input: fs.createReadStream(sourceFile),
    crlfDelay: Infinity,
  });

  // Reading data line by line
  for await (const line of rl) {
    linesRead++;
    if (linesRead > linesToSkip) {
      data = splitFunction(line);

      //Only copying data for the mapped fields
      for (let i = 0; i < mapping.length; i++) dataRow[mapping[i].no] = data[mapping[i].sourceFieldId];

      //Only copying data for the fields with date formats assigned
      for (let i = 0; i < dateFormats.length; i++)
        dataRow[dateFormats[i].no] = dayjs(dataRow[dateFormats[i].no], dataRow[dateFormats[i].dateFormat]).format(DATE_FORMAT);

      // Adding Data
      try {
        await dataSource.query(insertSQL, dataRow);
        totalRecords++;
      } catch (e) {
        logger.error(e.message);
        logger.error("Values:");
        logger.error(JSON.stringify(dataRow, null, 4));
      }

      printProgress(line);
      if (linesRead === maxLinesToRead + linesToSkip) break;
    }
  }

  await dataSource.destroy();
}

// SQL Server Functions

async function importSQLServer() {
  let pool;
  let rowIndex = 0;
  let tableColumns = [];
  const dataRow = [];

  function getSqlType(dataType, fieldLength) {
    switch (dataType) {
      case "INT":
        return sql.Int;
      case "NVARCHAR":
        return sql.NVarChar(fieldLength);
      case "VARCHAR":
        return sql.NVarChar(fieldLength);
      default:
        return sql.VarChar(255);
    }
  }

  // SQL Server connection configuration
  connection = {
    user: actionParameters.targetConnection.username,
    password: actionParameters.targetConnection.password,
    server: actionParameters.targetConnection.host,
    database: actionParameters.targetConnection.database,
    options: {
      encrypt: false, // Use this if you're on Windows Azure
      validateConnection: false,
      pool: {
        max: 50,
        min: 1,
      },
    },
  };

  if (actionParameters.targetConnection.instanceName)
    connection.server = `${actionParameters.targetConnection.host}\\${actionParameters.targetConnection.instanceName}`;

  pool = await sql.connect(connection);
  const request = pool.request();
  const fieldsQuery = getFieldsSql("mssql", actionParameters.targetTable);
  const fields = await request.query(fieldsQuery);

  tableColumns = getTableColumns(fields.recordset);

  dataRow.length = tableColumns.length;

  // Assigning variables values

  tableColumns
    .filter((item1) => item1.mappingType === "2") // Mapped to variable
    .forEach((item2) => {
      dataRow[item2.no] = workflowVariables[item2.variable] ? workflowVariables[item2.variable] : workflowParameters[item2.variable];
    });

  //logger.error(JSON.stringify(dataRow, null, 4));

  // Populating mapping array

  mapping = tableColumns
    .filter((item1) => item1.sourceFieldId > -1)
    .map((item) => {
      return { no: item.no, sourceFieldId: item.sourceFieldId };
    });

  if (mapping.length === 0) throw new Error(`No Field names`);

  // Populating Dateformat array

  dateFormats = tableColumns
    .map((item1, no) => {
      // Adding no
      return { ...item1, no };
    })
    .filter((item2) => item2.mappingType !== "0") // Mapped to field or variable
    .filter((item3) => item3.dateFormat) // Has date format
    .map((item4) => {
      return { no: item4.no, dateFormat: item4.dateFormat };
    });

  // Create a table object
  const table = new sql.Table(actionParameters.targetTable);

  // Define columns based on the retrieved table columns and types
  tableColumns.forEach((column) => {
    const sqlType = getSqlType(column.type);
    table.columns.add(column.name, sqlType, { nullable: true });
  });

  const rl = readline.createInterface({
    input: fs.createReadStream(sourceFile),
    crlfDelay: Infinity,
  });

  // Reading data line by line
  for await (const line of rl) {
    linesRead++;
    if (linesRead > linesToSkip) {
      rowIndex++;
      data = splitFunction(line);

      //Only copying data for the mapped fields
      for (let i = 0; i < mapping.length; i++) dataRow[mapping[i].no] = data[mapping[i].sourceFieldId];

      //Only assign data for the fields with date formats assigned
      for (let i = 0; i < dateFormats.length; i++)
        dataRow[dateFormats[i].no] = dayjs(dataRow[dateFormats[i].no], dataRow[dateFormats[i].dateFormat]).format(DATE_FORMAT);

      //logger.error(JSON.stringify(dataRow, null, 4));

      table.rows.add(...dataRow);
      if (rowIndex === 10000) {
        const result = await request.bulk(table);
        totalRecords = totalRecords + result.rowsAffected;
        rowIndex = 0;
        table.rows.length = 0;
      }

      printProgress(line);
      if (linesRead === maxLinesToRead + linesToSkip) break;
    }
  }

  if (table.rows.length > 0) {
    const result = await request.bulk(table);
    totalRecords = totalRecords + result.rowsAffected;
  }
  await pool.close();
}

try {
  // Safety checks
  if (!actionParameters.mapping) throw new Error(`Missing Mapping`);
  sourceFile = cleanPath(actionParameters.sourceFile);
  if (!fs.existsSync(sourceFile)) throw new Error(`File ${sourceFile} not found`);

  if (typeof actionParameters.mapping === "string") actionParameters.mapping = JSON.parse(actionParameters.mapping);

  // File size
  totalSize = fs.statSync(sourceFile).size;

  linesToSkip = Number(actionParameters.linesToSkip);
  maxLinesToRead = Number(actionParameters.maxLinesToRead);

  logger.debug(`Loading data from ${sourceFile}`);

  if (linesToSkip > 0) logger.debug(`Skipping first ${linesToSkip} line(s)`);
  if (maxLinesToRead > 0) logger.debug(`Reading up to ${maxLinesToRead} line(s)`);

  if (actionParameters.targetConnection.type === "mssql") await importSQLServer();
  else await importTypeORM();

  actionParameters.recordsImported = totalRecords;

  const endDate = new Date();
  const seconds = Math.abs(startDate - endDate) / 1000;

  logger.debug("Import completed");
  logger.debug(`Number of lines read ${linesRead}`);
  logger.debug(`Number of records imported ${totalRecords}`);
  logger.debug(`Records per second ${(totalRecords / seconds).toFixed(2)}`);
  logger.debug(`Time taken ${secondsToHMS(seconds)}`);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}

return actionParameters.ExecutionResult;
