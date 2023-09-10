// Restore single connection

require('dotenv').config();

const fs = require('fs');
const path = require('node:path');

const dataSource = require('./connection.js');

const CONNECTION_ID = 'FTP'; // <<<<< Amend before running

async function restore() {
  console.log('Restoring connection');

  await dataSource.initialize();
  const connectionsTable = dataSource.getRepository('Connections');

  const connectionsFolderName = path.resolve('./connections');
  const id = CONNECTION_ID;

  const folderName = path.resolve(connectionsFolderName, id);
  const definition = JSON.parse(fs.readFileSync(path.resolve(folderName, 'metaData.json')));
  const properties = JSON.parse(fs.readFileSync(path.resolve(folderName, 'properties.json')));
  const script = String(fs.readFileSync(path.resolve(folderName, 'validationScript.js')));

  const connectionsDefinition = JSON.stringify({ definition, properties, script }, null, 4);
  let record = await connectionsTable.findOne({ where: { id } });
  console.log(id);
  if (record) {
    record.enabled = definition.enabled;
    record.name = definition.name;
    record.description = definition.description;
    record.version = definition.version;
    record.definition = connectionsDefinition;
    record.updated_by = definition.updated_by;
    connectionsTable.update({ id }, record);
  } else {
    record = {
      id,
      definition: connectionsDefinition,
      enabled: definition.enabled,
      name: definition.name,
      description: definition.description,
      version: definition.version,
      updated_by: definition.updated_by,
      created_by: definition.created_by,
    };
    await connectionsTable.insert(record);
  }
  console.log('Connection restore completed');
}

restore();
