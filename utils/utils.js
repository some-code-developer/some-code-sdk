const cleanPath = (path) => path;

function secondsToHMS(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

const getFieldsSql = (type, table) => {
  if (type === "sqlite")
    return `SELECT m.cid+1       as no,
                                        m.name        as field,
                                        UPPER(m.type) as data_type,
                                        m.dflt_value  as db_default,
                                        case when  m."notnull" =1 then 'Yes' else 'No' end as not_null,
                                        0             as field_length,
                                        0             as field_scale
                                 FROM
                                        sqlite_master as t
                                 JOIN
                                        pragma_table_info(t.name) as m on t.name = '${table}'
                                 WHERE
                                        t.type = 'table'
                                 order by m.cid   `;

  if (type === "mssql")
    return `select ordinal_position as no,
                   column_name as field, 
                   Upper(data_type) as data_type, 
                   column_default as db_default,
                   case when is_nullable='YES' then 'No' else 'Yes' end as not_null,
                   case when CHARACTER_MAXIMUM_LENGTH is not null then CHARACTER_MAXIMUM_LENGTH
                        when NUMERIC_PRECISION is not null then NUMERIC_PRECISION
                        when DATETIME_PRECISION is not null then DATETIME_PRECISION
                   else null end as field_length,
                   NUMERIC_SCALE as field_scale
            from information_schema.columns
            where '['+TABLE_SCHEMA+'].['+TABLE_NAME+']'=N'${table}' 
            order by ordinal_position`;

  if (type === "postgres")
    return `select ordinal_position as no,
                   column_name as field,
                   Upper(data_type) as data_type, 
                   column_default as db_default,
                   case when is_nullable='YES' then 'No' else 'Yes' end as not_null,
                   case when character_maximum_length is not null then character_maximum_length
                        when numeric_precision is not null then numeric_precision
                        when datetime_precision is not null then datetime_precision
                        when character_octet_length is not null then character_octet_length
                   else null end as field_length,
                   numeric_scale as field_scale
            from information_schema.columns 
            where table_schema|| '.' ||table_name ='${table}'
            order by ordinal_position`;

  if (type === "mysql")
    return `select ordinal_position as no,
                   column_name as field,
                   Upper(data_type) as data_type, 
                   column_default as db_default,
                   case when is_nullable='YES' then 'No' else 'Yes' end as not_null,
                   case when character_maximum_length is not null then character_maximum_length
                        when numeric_precision is not null then numeric_precision
                        when datetime_precision is not null then datetime_precision
                        when character_octet_length is not null then character_octet_length
                   else null end as field_length,
                   numeric_scale as field_scale     
            from information_schema.columns 
            where table_schema not in ('information_schema','mysql','performance_schema','sys') and
            CONCAT(table_schema,'.',table_name)='${table}'
            order by ordinal_position`;

  if (type === "oracle")
    return `Select TC.Column_ID as "no",
                   TC.COLUMN_NAME as "field",
                   upper(TC.DATA_TYPE) as "data_type",
                   tc.data_default as db_default",
                   CASE tc.NULLABLE 
                   WHEN 'N' THEN 'Yes'
                   WHEN 'Y' THEN 'No'
                   END AS  "not_null",
                   DECODE(TC.DATA_TYPE,'NUMBER',TC.DATA_PRECISION,TC.DATA_LENGTH) as "field_length",
                   TC.DATA_SCALE as "field_scale"
            from all_Tab_Columns TC,
            all_col_comments c
            Where  TC.OWNER||'.'||TC.Table_Name='${table}' and
                   TC.OWNER=C.OWNER and
                   TC.Table_Name=C.Table_Name and
                   TC.COLUMN_NAME=C.COLUMN_NAME 
            Order By TC.Column_ID`;
};

const getTablesSql = (type) => {
  if (type === "sqlite") return "SELECT name as table_name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%' order by 1";

  if (type === "mssql")
    return `SELECT concat('[',s.NAME ,'].[',  t.NAME,']') as table_name
                                FROM SYS.tables t
                                INNER JOIN SYS.SCHEMAS s
                                ON t.SCHEMA_ID = s.SCHEMA_ID
                                WHERE t.is_ms_shipped=0 and type_desc = 'USER_TABLE'
                                ORDER BY s.NAME, t.NAME`;

  if (type === "postgres")
    return `SELECT table_schema|| '.' ||table_name as table_name FROM information_schema.tables WHERE table_schema not in ('information_schema','pg_catalog') and table_type='BASE TABLE' order by 1`;

  if (type === "mysql")
    return `SELECT table_schema|| '.' ||table_name as table_name FROM information_schema.tables WHERE table_type ='BASE TABLE' and table_schema not in ('information_schema','mysql','performance_schema','sys') order by 1`;

  if (type === "oracle")
    return `SELECT owner||'.'||Decode(INSTRB(table_name,' ', 1, 1),0,table_name,'"'||table_name||'"') as table_name FROM all_tables order by 1`;
};

const splitStringDelimited = (inputString, delimiter, optionalQuote = null) => {
  const result = [];
  let currentToken = "";
  let insideQuote = false;

  for (let i = 0; i < inputString.length; i++) {
    const currentChar = inputString[i];

    if (currentChar === optionalQuote) {
      insideQuote = !insideQuote;
    } else if (currentChar === delimiter && !insideQuote) {
      result.push(currentToken);
      currentToken = "";
    } else {
      currentToken += currentChar;
    }
  }

  // Add the last token
  result.push(currentToken);

  return result;
};

const splitStringFixed = (inputString, widths) => {
  const result = [];
  let currentIndex = 0;

  // Loop through each width in the array
  for (const width of widths) {
    // Get a substring of the specified width
    const substring = inputString.substr(currentIndex, width);

    // Add the substring to the result array
    result.push(substring);

    // Update the current index for the next iteration
    currentIndex += width;
  }

  return result;
};

function splitStringNoQuote(inputString) {
  let resultArray = inputString.split(actionParameters.sourceDelimiter);
  return resultArray;
}

function getSplitStringFunction(delimited, delimiter, quote, widths) {
  if (!delimited)
    return function (inputString) {
      return splitStringFixed(inputString, widths);
    };
  else if (quote)
    return function (inputString) {
      return splitStringDelimited(inputString, delimiter, quote);
    };
  else
    return function (inputString) {
      return splitStringNoQuote(inputString, delimiter);
    };
}

module.exports = {
  cleanPath,
  secondsToHMS,
  getFieldsSql,
  getTablesSql,
  splitStringNoQuote,
  splitStringFixed,
  splitStringDelimited,
  getSplitStringFunction,
};
