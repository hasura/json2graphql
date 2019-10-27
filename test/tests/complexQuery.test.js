const query = `
query {
  j2g_test_favoriteRoutes {
    j2g_test_routesByJ2g_test_routesId {
      j2g_test_leaguesByJ2g_test_leaguesId {
        j2g_test_flightssByJ2g_test_leaguesId (
          order_by: {
            id:asc
          }
        ){
          j2g_test_flightCommentssByJ2g_test_flightsId(order_by: {j2g_test_users_id:asc}) {
            j2g_test_users_id
            j2g_test_usersByJ2g_test_usersId {
              email
            }
          }
        }
      }
    }
  }
}
`;

const run = response => {
  if (
    response.data.j2g_test_favoriteRoutes[0].j2g_test_routesByJ2g_test_routesId
    .j2g_test_leaguesByJ2g_test_leaguesId
    .j2g_test_flightssByJ2g_test_leaguesId[0]
    .j2g_test_flightCommentssByJ2g_test_flightsId[0]
    .j2g_test_usersByJ2g_test_usersId.email === 'osxcode@gmail.com'
  ) {
    return true;
  }
  return 'Unexpected response.';
};

module.exports = {
  name: 'Complex query returns correct data',
  query,
  run,
};
