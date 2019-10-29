const query = `
query {
  j2g_test_user_tags(where: {j2g_test_users_id: {_eq: 1}}) {
    j2g_test_users_id
    j2g_test_tags_id
  }
}
`;

const run = ({data}) => {
  const returnedValue = data.j2g_test_user_tags;
  if (returnedValue.length === 2) {
    return true;
  }
  return `
Returned value:
${JSON.stringify(returnedValue, null, 2)}`;
};

module.exports = {
  name: 'Compound key records found',
  query,
  run,
};
