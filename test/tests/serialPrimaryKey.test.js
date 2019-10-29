const query = `
mutation InsertMutation {
  insert_j2g_test_serialPrimaryKeys(objects: {name: "d"}) {
    returning {
      id
      name
    }
  }
}
`;

const run = ({data}) => {
  const returnedValue = data.insert_j2g_test_serialPrimaryKeys.returning[0].id;
  const expectedValue = 7;
  if (returnedValue === expectedValue) {
    return true;
  }
  return `
Returned id did not equal ${expectedValue}:
${JSON.stringify(returnedValue, null, 2)}`;
};

module.exports = {
  name: 'Integer primary key auto increments',
  query,
  run,
};
