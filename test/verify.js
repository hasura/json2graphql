const {query} = require('graphqurl');
const fetch = require('node-fetch');
const glob = require('glob');
const path = require('path');

const testTables = [
  'j2g_test_favoriteFlights',
  'j2g_test_favoriteRoutes',
  'j2g_test_files',
  'j2g_test_flightComments',
  'j2g_test_flightWaypoints',
  'j2g_test_flights',
  'j2g_test_leagueSeasonUserScores',
  'j2g_test_leagues',
  'j2g_test_mimetypes',
  'j2g_test_noteTypes',
  'j2g_test_routeWaypoints',
  'j2g_test_routes',
  'j2g_test_sponsors',
  'j2g_test_types',
  'j2g_test_userConfigs',
  'j2g_test_userLeagues',
  'j2g_test_userStatus',
  'j2g_test_users',
  'j2g_test_waypointChats',
  'j2g_test_waypointNotes',
  'j2g_test_waypointPhotos',
  'j2g_test_waypointSuggestions',
  'j2g_test_waypoints',
  'j2g_test_wings',
];

const deleteTables = () => {
  const deleteQuery = {
    type: 'bulk',
    args: testTables.map(tname => ({
      type: 'run_sql',
      args: {
        sql: `drop table if exists public."${tname}" cascade;`,
        cascade: true,
      },
    })),
  };
  fetch(
    `${process.env.TEST_HGE_URL}/v1/query`,
    {
      method: 'POST',
      headers: {'x-hasura-admin-secret': process.env.TEST_X_HASURA_ADMIN_SECRET},
      body: JSON.stringify(deleteQuery),
    }
  ).then(() => {
    console.log('Test tables deleted!');
  }).catch(() => console.log('Failed deleting test tables'));
};

const loadTests = () => {
  let tests = [];
  glob.sync('./tests/**/*.test.js').forEach(function (file) {
    tests.push(require(path.resolve(file)));
  });
  return tests;
};

const verifyDataImport = () => {
  // let resp = null;

  const tests = loadTests();
  let queue = [];

  for (const test of tests) {
    queue.push(
      new Promise((resolve, reject) => {
        return query({
          query: test.query,
          endpoint: `${process.env.TEST_HGE_URL}/v1/graphql`,
          headers: {'x-hasura-admin-secret': process.env.TEST_X_HASURA_ADMIN_SECRET},
        }).then(response => {
          const testResult = test.run(response);
          if (testResult === true) {
            console.log(`✔︎ ${test.name} passed`);
            resolve();
          } else {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject(`✖ ${test.name} failed. ${testResult}`);
          }
        }).catch(error => {
          console.log(error);
        });
      }).catch(error => {
        console.log(error);
      })
    );
  }
  return Promise.all(queue);

  // return query({
  //   query: complexQuery,
  //   endpoint: `${process.env.TEST_HGE_URL}/v1/graphql`,
  //   headers: {'x-hasura-admin-secret': process.env.TEST_X_HASURA_ADMIN_SECRET},
  // }).then(response => {
  //   resp = response;
  //   if (response.data.j2g_test_favoriteRoutes[0]
  //   .j2g_test_routesByJ2g_test_routesId
  //   .j2g_test_leaguesByJ2g_test_leaguesId
  //   .j2g_test_flightssByJ2g_test_leaguesId[0]
  //   .j2g_test_flightCommentssByJ2g_test_flightsId[0]
  //   .j2g_test_usersByJ2g_test_usersId.email === 'osxcode@gmail.com') {
  //     console.log('✔︎ Test passed');
  //   } else {
  //     console.log('✖ Test failed. Unexpected response.');
  //     console.log(response.data);
  //   }
  // }).catch(() => {
  //   console.log('✖ Test failed. Unexpected response.');
  //   console.log(JSON.stringify(resp, null, 2));
  // });
};
verifyDataImport().then(() => deleteTables()).catch(() => deleteTables());
