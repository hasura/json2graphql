const query = `
mutation InsertMutation {
  insert_j2g_test_uuids(objects: {id: 2}) {
    returning {
      version4
      version1
    }
  }
}
`;

const run = ({data}) => {
  const returnedValue = data.insert_j2g_test_uuids.returning[0];
  if (typeof returnedValue.version1 === 'string' && returnedValue.version1.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/) &&
      typeof returnedValue.version4 === 'string' && returnedValue.version4.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)) {
    return true;
  }
  return `
Returned values are not UUIDS:
${JSON.stringify(returnedValue, null, 2)}`;
};

module.exports = {
  name: 'UUID data saved as UUID column',
  query,
  run,
};
