const {generate, sanitizeData} = require('./generateTables');
const {generateSql, runSql} = require('./sql');
const {cli} = require('cli-ux');
const {trackTables} = require('./track');
const {getInsertOrder, insertData} = require('./insert');
const {createRelationships} = require('./relationships');
const {createTables} = require('./check');

const importData = async (jsonDb, url, headers, overwrite) => {
  cli.action.start('Processing JSON data');
  const db = sanitizeData(jsonDb);
  const tables = generate(db);
  const sql = generateSql(tables);
  cli.action.stop('Done!');
  cli.action.start('Checking database');
  createTables(tables, url, headers, overwrite, runSql, sql).then(() => {
    cli.action.stop('Done!');
    cli.action.start('Tracking tables');
    trackTables(tables, url, headers).then(() => {
      cli.action.stop('Done!');
      cli.action.start('Creating relationships');
      createRelationships(tables, url, headers).then(() => {
        cli.action.stop('Done!');
        cli.action.start('Inserting data');
        const insertOrder = getInsertOrder(tables);
        insertData(insertOrder, db, tables, url, headers).then(() => {
          // eslint-disable-next-line max-nested-callbacks
          const tablesNeedingResetIdSequences = tables.filter(t => t.columns.some(c => c.name === 'id' && c.type === 'serial'));
          // eslint-disable-next-line max-nested-callbacks
          const resetSQL = tablesNeedingResetIdSequences.map(t => `SELECT setval(pg_get_serial_sequence('"public"."${t.name}"', 'id'), max(id)) FROM public."${t.name}";`);
          runSql(resetSQL, url, headers);
        });
      });
    });
  });
};

module.exports = importData;
