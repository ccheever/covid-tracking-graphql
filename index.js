let { ApolloServer, gql } = require('apollo-server-express');
let express = require('express');

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
  </body>
</html>
    `);
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

async function mainAsync() {
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
};
