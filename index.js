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

const endpoint = "https://vta-test-school-7146.pflms.net/graphql";

const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.REVIEW_BOT_USER_TOKEN}`,
  },
});

const mutation = gql`
  mutation GradeSubmission(
    $submissionId: ID!
    $grades: [GradeInput!]!
    $checklist: JSON!
    $feedback: String
  ) {
    createGrading(
      submissionId: $submissionId
      grades: $grades
      checklist: $checklist
      feedback: $feedback
    ) {
      success
    }
  }
`;

const variables = {
  submissionId: "246279",
  grades: [{ evaluationCriterionId: "2695", grade: 2 }],
  checklist: [
    {
      kind: "shortText",
      title: "Describe your submission",
      result: "This is something awesome",
      status: "noAnswer",
    },
  ],
  feedback: "Thats great job",
};

// most @actions toolkit packages have async methods
async function run() {
  const data = await graphQLClient.request(mutation, variables);
  console.log(JSON.stringify(data, undefined, 2));
}

run().catch((error) => console.log(error));
