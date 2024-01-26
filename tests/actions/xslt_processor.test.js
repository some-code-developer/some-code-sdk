require('dotenv').config();
const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'xslt_processor';
const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

const xml = `<Table>
<Record>
 <ID>1</ID>
 <Company>James Bond Production</Company>
 <Amount>13</Amount>
</Record>
<Record>
 <ID>2</ID>
 <Company>Green Cloud</Company>
 <Amount>14</Amount>
</Record>
</Table>`;
const xslt = `<?xml version="1.0" encoding="UTF-8"?>
    <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="xml" indent="yes" version="1.0"/>\
    <xsl:template match="Table">

    <Table>
     <xsl:for-each select="Record">
      <Record>
       <ID><xsl:value-of select="ID"/></ID>
       <Company><xsl:value-of select="Company"/></Company>
       <Amount><xsl:value-of select="Amount"/></Amount>
      </Record>
     </xsl:for-each>
    </Table>
    </xsl:template>
   </xsl:stylesheet>`;

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = { xml, xslt };

    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
    expect(typeof actionParameters.result).toBe('string');
  });

  test('Testing Failure - missing xml', async () => {
    const actionParameters = { xslt };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing xslt', async () => {
    const actionParameters = { xml };
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });

  test('Testing Failure - missing everything', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });
});
