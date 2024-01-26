// Documentation
// https://typeorm.io/

// mappingType: "0" Not Mapped
// mappingType: "1" Mapped to Field
// mappingType: "2" Mapped to Variable

const typeorm = require("typeorm");
const { Buffer } = require("node:buffer");
const fs = require("fs");
const readline = require("readline");
const sql = require("mssql");

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
  let rowIndex = 0;
  let tableColumns = [];
  let parameters = [];
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
  fieldNames = tableColumns.filter((item1) => item1.mappingType !== "0").map((item2) => `"${item2.name}"`);

  if (actionParameters.targetConnection.type === "postgres") parameters = fieldNames.map((field, i) => `$${i + 1}`);
  else parameters = fieldNames.map((field) => "?");
  // TO DO: Test with oracle

  const insertSQL = `INSERT INTO ${actionParameters.targetTable} (${fieldNames.join(",")}) VALUES (${parameters.join(",")}) `;

  dataRow.length = fieldNames.length;

  // Assigning variables values

  tableColumns
    .filter((item1, i) => item1.mappingType !== "0")
    .forEach((item2) => {
      if (item2.mappingType === "2")
        dataRow[i] = workflowVariables[item2.fieldName] ? workflowVariables[item2.fieldName] : workflowParameters[item2.fieldName];
    });

  //logger.debug(insertSQL);

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
      // Adding Data
      try {
        await dataSource.query(insertSQL, dataRow);
        totalRecords++;
      } catch (e) {
        logger.error(e.message);
        logger.debug("Values:", JSON.stringify(dataRow, null, 4));
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

  //Assign variables
  for (let i = 0; i < tableColumns.length; i++)
    if (tableColumns[i].mappingType === "2")
      dataRow[i] = workflowVariables[tableColumns[i].fieldName]
        ? workflowVariables[tableColumns[i].fieldName]
        : workflowParameters[tableColumns[i].fieldName];

  // Populating mapping array
  mapping = tableColumns
    .filter((item1) => item1.sourceFieldId > -1)
    .map((item) => {
      return { no: item.no, sourceFieldId: item.sourceFieldId };
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
