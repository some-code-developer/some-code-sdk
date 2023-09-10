// Restore single action

require('dotenv').config();

const fs = require('fs');
const path = require('node:path');

const actionIconsFolder = path.resolve(process.env.PUBLIC_FOLDER, 'action-icons');
const dataSource = require('./connection.js');

async function restore(id) {
  console.log('Restoring action');

  await dataSource.initialize();

  const actionsTable = dataSource.getRepository('Actions');

  const actionsFolderName = path.resolve('./actions');

  const folderName = path.resolve(actionsFolderName, id);
  const formDefinition = JSON.parse(fs.readFileSync(path.resolve(folderName, 'metaDataDefinition.json')));
  const formData = JSON.parse(fs.readFileSync(path.resolve(folderName, 'metaData.json')));
  const propertiesDefinition = JSON.parse(fs.readFileSync(path.resolve(folderName, 'properties.json')));
  const script = String(fs.readFileSync(path.resolve(folderName, 'actionScript.js')));

  const definition = JSON.stringify({ formDefinition, formData, propertiesDefinition, script }, null, 4);
  const record = await actionsTable.findOne({ where: { id } });
  console.log(`Restoring ${id}`);
  if (record) {
    record.definition = definition;
    record.enabled = formData.enabled;
    record.name = formData.name;
    record.description = formData.description;
    record.version = formData.version;
    record.action_type = formData.action_type;
    record.updated_by = formData.updated_by;
    delete record.updated_at;
    actionsTable.update({ id }, record);
  } else {
    const record = { definition, id };
    record.enabled = formData.enabled;
    record.name = formData.name;
    record.description = formData.description;
    record.version = formData.version;
    record.action_type = formData.action_type;
    record.updated_by = formData.updated_by;
    record.created_by = formData.created_by;
    await actionsTable.insert(record);
  }
  const sourceFileName = path.resolve(folderName, `${id}.svg`);
  const targetFileName = path.resolve(actionIconsFolder, `${id}.svg`);
  fs.copyFileSync(sourceFileName, targetFileName);

  console.log('Action restore completed');
}

module.exports = restore;
