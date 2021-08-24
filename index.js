const GraphQLClient = require("graphql-request").GraphQLClient;
const gql = require("graphql-request").gql;

const query = gql`
  {
    courses {
      nodes {
        id
      }
    }
  }
`;

const endpoint = "https://www.pupilfirst.school/graphql";

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.REVIEW_BOT_USER_TOKEN}`,
  },
});

// most @actions toolkit packages have async methods
async function run() {
  const data = await graphQLClient.request(query);
  console.log(JSON.stringify(data, undefined, 2));
}

run();
