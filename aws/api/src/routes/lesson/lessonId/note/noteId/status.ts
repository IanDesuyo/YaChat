import { App } from "types";
import Route from "types/route";
import { APIGatewayEvent } from "aws-lambda";
import response from "utils/response";
import { parseObjectId } from "utils/parser";
import { StartKeyPhrasesDetectionJobCommand } from "@aws-sdk/client-comprehend";

const GET = async (app: App, event: APIGatewayEvent) => {
  const lessonId = parseObjectId(event.pathParameters.lessonId);
  const noteId = parseObjectId(event.pathParameters.noteId);

  const note = await app.db.getNote(noteId);

  if (!note) {
    return response(404, {
      message: "not found",
      i18n: "note.notFound",
    });
  }

  const status = {
    incomplete: 0,
    completed: 0,
    analyzed: !!note.topics,
  };

  for (const file of note.files) {
    status[file.textractResult ? "completed" : "incomplete"]++;
  }

  if (status.incomplete === 0 && !status.analyzed && !note.comprehendJobId) {
    const command = new StartKeyPhrasesDetectionJobCommand({
      InputDataConfig: {
        S3Uri: `s3://${process.env.AWS_S3_BUCKET}/textract_result/notes/${note.key}`,
      },
      OutputDataConfig: {
        S3Uri: `s3://${process.env.AWS_S3_BUCKET}/comprehend_result/notes/${note.key}`, // output.tar.gz
      },
      JobName: `YaChat Note analyze ${note.key}`,
      LanguageCode: "en",
      DataAccessRoleArn: process.env.AWS_JOB_ARN,
    });

    const result = await app.comprehend.send(command);

    await app.db.updateNote(noteId, {
      comprehendJobId: result.JobId,
    });
  }

  return response(200, {
    message: "success",
    i18n: "notes.get.success",
    data: status,
  });
};

export default {
  GET,
} as Route;
