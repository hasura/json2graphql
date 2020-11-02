const fetch = require('node-fetch');
const throwError = require('./error');

const getObjRelationshipName = dep => {
  const relName = `${dep}`;
  return relName;
};

const getArrayRelationshipName = (table, parent) => {
  const relName = `${table}s`;
  return relName;
};

const generateRelationships = tables => {
  const objectRelationships = [];
  const arrayRelationships = [];
  tables.forEach(table => {
    if (table.dependencies.length > 0) {
      table.dependencies.forEach(dep => {
        objectRelationships.push({
          type: 'create_object_relationship',
          args: {
            table: table.name,
            name: `${getObjRelationshipName(dep)}`,
            using: {
              foreign_key_constraint_on: `${dep}Id`,
            },
          },
        });
        arrayRelationships.push({
          type: 'create_array_relationship',
          args: {
            table: dep,
            name: `${getArrayRelationshipName(table.name, dep)}`,
            using: {
              foreign_key_constraint_on: {
                table: table.name,
                column: `${dep}Id`,
              },
            },
          },
        });
      });
    }
  });
  return {
    objectRelationships,
    arrayRelationships,
  };
};

const createRelationships = async (tables, url, headers) => {
  const relationships = generateRelationships(tables);
  const bulkQuery = {
    type: 'bulk',
    args: [],
  };
  relationships.objectRelationships.forEach(or => bulkQuery.args.push(or));
  relationships.arrayRelationships.forEach(ar => bulkQuery.args.push(ar));
  const resp = await fetch(
    `${url}/v1/query`,
    {
      method: 'POST',
      body: JSON.stringify(bulkQuery),
      headers,
    }
  );
  if (resp.status !== 200) {
    const error = await resp.json();
    throwError(JSON.stringify(error, null, 2));
  }
};

module.exports = {
  createRelationships,
};
