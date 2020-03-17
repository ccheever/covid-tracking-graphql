let { ApolloServer, gql } = require('apollo-server-express');
let express = require('express');
let luxon = require('luxon');
let timeconstants = require('timeconstants');

let data = require('./data');
let resolvers = require('./resolvers');
let typeDefs = require('./typeDefs');

let server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  formatError: (error) => {
    console.error(error);
    return error;
  },
  formatResponse: (response) => {
    // console.log("Sending response at " + new Date());
    // console.log(response);
    return response;
  },
  context: ({ req }) => {
    return {};
  },
});

let app = express();

app.get('/', async (req, res) => {
  let colors = require('./colors');
  res.send(`
<html>
  <head>
    <title>😷 COVID-19 Tracking API</title>
    <style>
      BODY {
        font-family: monospace;
      }
    </style>
  </head>
  <body>
    <strong style="color: ${colors.primary};">😷 COVID-19 Tracking API</strong>
    <hr style="border: 1px solid ${colors.secondary};" />
    <a href="/graphql">/graphql</a>
    <a href="/refresh">/refresh</a>
    <a href="/status">/status</a>
  </body>
</html>
    `);
});

app.get('/status', async (req, res) => {
  res.json({
    ok: true,
    autoRefreshInterval: AutoRefreshInterval,
    autoRefreshOn: !!_autoRefreshIntervalHandle,
  });
});

let AutoRefreshInterval = 5 * timeconstants.minute;

app.all('/refresh', async (req, res) => {
  let result = await data.refreshAsync();
  let interval = luxon.Duration.fromMillis(AutoRefreshInterval);
  if (!!_autoRefreshIntervalHandle) {
    result.note =
      'This server will automatically refresh its data every ' +
      interval.toString();
  } else {
    result.note =
      'This server will currently only refresh data when manually instructed to do so';
  }
  res.json(result);
});

server.applyMiddleware({ app });

let port = process.env.PORT || 9110;

function handleCommandLineKeypresses(urls) {
  let readline = require('readline');
  readline.emitKeypressEvents(process.stdin);
  if (typeof process.stdin.setRawMode === 'function') {
    process.stdin.setRawMode(true);
  }
  let help = 'ℹ️  o - Open server index | g - Open GraphQL console | q - quit';
  console.log(help);
  process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      process.exit();
    }
    let open = require('open');
    switch (key.name) {
      case 'o':
        open(urls.appUrl);
        break;
      case 'g':
        open(urls.graphqlUrl);
        break;
      case 'q':
        process.exit();
        break;
      default:
        console.log(help);
        break;
    }
  });
}

let _autoRefreshIntervalHandle = null;
async function startAutoRefresh() {
  _autoRefreshIntervalHandle = setInterval(() => {
    // TODO: Add retries maybe?
    data.refreshAsync();
  }, AutoRefreshInterval);
}

async function stopAutoRefresh() {
  if (_autoRefreshIntervalHandle) {
    clearInterval(_autoRefreshIntervalHandle);
  }
}

async function mainAsync() {
  // Before we do anything, populate our copy of the data from the source
  await data.refreshAsync();
  startAutoRefresh();

  return new Promise((resolve, reject) => {
    app.listen({ port }, () => {
      console.log(`😷 GraphQL API Server ready at http://localhost:${port}`);
      console.log(
        `🗂️  GraphQL Server ready at http://localhost:${port}${server.graphqlPath}`
      );

      let localIp = require('local-ip');
      let myIp = localIp();
      let appUrl = `http://localhost:${port}`;
      let appLanUrl = `http://${myIp}:${port}`;
      resolve({
        appUrl,
        appLanUrl,
        graphqlUrl: `${appUrl}${server.graphqlPath}`,
        graphqlLanUrl: `${appLanUrl}${server.graphqlPath}`,
      });
    });
  });
}

if (require.main === module) {
  (async () => {
    let urls = await mainAsync();
    if (process.stdin.isTTY) {
      handleCommandLineKeypresses(urls);
    }
  })();
}

module.exports = {
  server,
  app,
  port,
  mainAsync,
  startAutoRefresh,
  stopAutoRefresh,
  AutoRefreshInterval,
};
