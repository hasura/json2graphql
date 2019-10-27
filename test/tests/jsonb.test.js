const isEqual = require('lodash.isequal');

const query = `
query {
  j2g_test_users(where: {id: {_eq: 1}}) {
    object
  }
}
`;

const run = ({data}) => {
  const returnedValue = data.j2g_test_users[0].object;
  const expectedValue = {hey: 'there', whats: 'up'};
  if (isEqual(expectedValue, returnedValue)) {
    return true;
  }
  return `
Expected value:
${JSON.stringify(expectedValue, null, 2)}
Returned value:
${JSON.stringify(returnedValue, null, 2)}`;
};

module.exports = {
  name: 'JSONB column returns JSON',
  query,
  run,
};
