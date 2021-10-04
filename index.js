const core = require("@actions/core");

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

const submissionData = core.getInput("submission_data");

const passed = core.getInput("passed");

const grades = submissionData.target.evaluationCriteria.map((ec) => {
  const ecGrade = {};
  ecGrade["evaluationCriterionId"] = ec.id;
  ecGrade["grade"] = passed ? ec.passGrade : ec.passGrade - 1;
});

const variables = {
  submissionId: submissionData.id,
  grades: grades,
  checklist: submissionData.checklist,
  feedback: core.getInput("pass_feedback"),
};

// most @actions toolkit packages have async methods
async function run() {
  const data = await graphQLClient.request(mutation, variables);
  console.log(JSON.stringify(data, undefined, 2));
}

run().catch((error) => console.log(error));
