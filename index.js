const core = require("@actions/core");
const fs = require("fs");
const path = require("path");

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

const endpoint = process.env.REVIEW_END_POINT;

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

const submissionData = JSON.parse(
  fs.readFileSync(
    path.join(process.env.GITHUB_WORKSPACE, "submission_data.json")
  )
);

const reportFilePath = core.getInput("report_path");

const reportData = JSON.parse(
  fs.readFileSync(path.join(process.env.GITHUB_WORKSPACE, reportFilePath))
);

const passed = reportData.status == "passed";

const skip = reportData.grade == "skip";

const grades = submissionData["target"]["evaluation_criteria"].map((ec) => {
  const ecGrade = {};
  ecGrade["evaluationCriterionId"] = ec.id;
  ecGrade["grade"] = passed ? ec.passGrade : ec.passGrade - 1;
});

const variables = {
  submissionId: submissionData.id,
  grades: grades,
  checklist: submissionData.checklist,
  feedback: reportData.feedback,
};

// most @actions toolkit packages have async methods
async function run() {
  if (!skip) {
    const data = await graphQLClient.request(mutation, variables);
    console.log(JSON.stringify(data, undefined, 2));
  } else {
    console.log("Skipped grading");
  }
}

let testMode = core.getBooleanInput("test_mode");

if (testMode) {
  console.log(submissionData);
  console.log(reportData);
} else {
  run().catch((error) => console.log(error));
}
