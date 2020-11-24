const throwError = require('./error');
const {cli} = require('cli-ux');
const fetch = require('node-fetch');

const getDataType = (data, column) => {
    if (typeof data === 'number') {
        return 'numeric';
    }
    if (typeof data === 'string' || data === null) {
        return 'text';
    }
    if (typeof data === 'boolean') {
        return 'boolean';
    }
    if (data.constructor.name === 'Date') {
        return 'timestamptz';
    }
    if (data.constructor.name === 'Object' || data.constructor.name === 'Array') {
        return 'jsonb';
    }
    throwError(`message: invalid data type given for column ${column}: ${typeof data}`);
};

const isForeign = (name, db) => {
    const l = name.length;
    if (l > 2) {
        if (name.substring(l - 2, l) === 'Id' &&
            Object.keys(db).find(tableName => {
                return tableName === name.substring(0, l - 2);
            })) {
            return true;
        }
    }
    return false;
};

const getColumnData = (dataArray, db) => {
    let refColumns = {};
    dataArray.forEach(row => {
        refColumns = {
            ...refColumns,
            ...row,
        };
    });
    const columnData = [];
    Object.keys(refColumns).forEach(column => {
        const columnMetadata = {};
        if (!column) {
            throwError("message: column names can't be empty strings");
        }
        columnMetadata.name = column;
        const sampleData = refColumns[column];
        columnMetadata.type = getDataType(sampleData, column, db);
        columnMetadata.isForeign = isForeign(column, db);
        columnData.push(columnMetadata);
    });
    return columnData;
};

const hasPrimaryKey = dataObj => {
    let has = true;
    dataObj.forEach(obj => {
        if (!Object.keys(obj).find(name => name === 'id')) {
            has = false;
        }
    });
    return has;
};

const sanitizeData = db => {
    const newDb = {};
    for (var tableName in db) {
        const newTableName = tableName.replace(/[^a-zA-Z0-9]/g, '_').replace(' ', '_');
        newDb[newTableName] = [];
        for (var i = db[tableName].length - 1; i >= 0; i--) {
            const data = db[tableName][i];
            const newData = {};
            for (var key in data) {
                const newKey = key.replace(/[^a-zA-Z0-9]/g, '_').replace(' ', '_');
                newData[newKey] = data[key];
            }
            newDb[tableName].push(newData);
        }
    }
    return newDb;
};

const generate = async (db, overwrite, url, headers) => {
    const metaData = [];

    const resp = await fetch(
        `${url}/v1/query`,
        {
            method: 'POST',
            headers,
            body: JSON.stringify({
                type: 'run_sql',
                args: {
                    sql: "select * from information_schema.tables where table_schema = 'public';",
                },
            }),
        }
    );

    if(resp.status !== 200) {
        throwError(resp.statusText);
    }

    const dbTables = await resp.json();
    const tableIndex = dbTables.result[0].indexOf('table_name');

    Object.keys(db).forEach(rootField => {
        const tableMetadata = {};
        let found = false;
        for (let i = dbTables.result.length - 1; i > 0; i--) {
            if (rootField === dbTables.result[i][tableIndex]) {
                found = true;
                cli.action.start(`Message: Your JSON database contains table "${rootField}" that already exist in Postgres public schema. Please use the flag "--overwrite" to overwrite them.`);
            }
        }
        if (!hasPrimaryKey(db[rootField], rootField)) {
            throwError(`message: a unique column with name "id" must present in table "${rootField}"`);
        }
        tableMetadata.skip = !overwrite && found
        tableMetadata.name = rootField;
        tableMetadata.columns = getColumnData(db[rootField], db);
        tableMetadata.dependencies = [];
        tableMetadata.columns.forEach(column => {
            if (column.isForeign) {
                tableMetadata.dependencies.push(column.name.substring(0, column.name.length - 2));
            }
        });
        metaData.push(tableMetadata);
    });
    return metaData;
};

module.exports = {
    generate,
    sanitizeData,
};
