const fetch = require('node-fetch');
const { cli } = require('cli-ux');

const truncateTables = async (tables, url, headers, truncate) => {
    if (!truncate) {
        return true;
    }
    for(const table of tables) {
        cli.action.start('Truncate table: ' + table.name);
        let request = JSON.stringify(
            {
                type: 'run_sql',
                args: {
                    sql: 'TRUNCATE "' + table.name + '" CASCADE;'
                },
            }
        );
        let resp = await fetch(
            `${url}/v1/query`,
            {
                method: 'POST',
                body: request,
                headers,
            }
        );

        if (resp.status !== 200) {
            let error = await resp.json();
            cli.action.stop(error.error);
        } else {
            cli.action.stop('Done!');
        }
    }
};

module.exports = {
    truncateTables,
};
