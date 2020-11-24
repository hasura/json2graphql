const {cli} = require('cli-ux');

const createTables = async (tables, url, headers, overwrite, runSql, sql) => {
  if (overwrite) {
    cli.action.stop('Skipped!');
    cli.action.start('Creating tables');
    await runSql(sql, url, headers);
  }
};

module.exports = {
  createTables,
};
