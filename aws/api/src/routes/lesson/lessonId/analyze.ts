import { App } from "../../../types";
import Route from "../../../types/route";
import { APIGatewayProxyEventBase, APIGatewayProxyCognitoAuthorizer } from "aws-lambda";
import response from "../../../utils/response";
import { parseObjectId } from "../../../utils/parser";
import { StartKeyPhrasesDetectionJobCommand } from "@aws-sdk/client-comprehend";

const GET = async (app: App, event: APIGatewayProxyEventBase<APIGatewayProxyCognitoAuthorizer>) => {
  const lessonId = parseObjectId(event.pathParameters.lessonId);

  const lesson = await app.db.getLesson(lessonId);

  if (!lesson) {
    return response(404, {
      message: "not found",
      i18n: "lesson.notFound",
    });
  }

  if (!lesson.keyPhrasesJobId) {
    return response(400, {
      message: "not analyzed",
      i18n: "lesson.notAnalyzed",
    });
  }

  if (!lesson.keyPhrases) {
    return response(200, {
      message: "analyze in progress",
      i18n: "lesson.analyze.inProgress",
    });
  }

  return response(200, {
    message: "success",
    i18n: "lesson.analyze.success",
    data: lesson.keyPhrases,
  });
};

const POST = async (app: App, event: APIGatewayProxyEventBase<APIGatewayProxyCognitoAuthorizer>) => {
  const lessonId = parseObjectId(event.pathParameters.lessonId);

  const lesson = await app.db.getLesson(lessonId);

  if (!lesson) {
    return response(404, {
      message: "not found",
      i18n: "lesson.notFound",
    });
  }

  const jobResult = await app.comprehend.send(
    new StartKeyPhrasesDetectionJobCommand({
      InputDataConfig: {
        S3Uri: `s3://${process.env.AWS_S3_BUCKET}/transcriptions/${lessonId}`,
        InputFormat: "ONE_DOC_PER_FILE",
      },
      OutputDataConfig: {
        S3Uri: `s3://${process.env.AWS_S3_BUCKET}/transcription_result/${lessonId}`,
      },
      LanguageCode: "en",
      DataAccessRoleArn: process.env.AWS_JOB_ARN,
      JobName: `YaChat - KeyPharses Detection [${lessonId}]`,
    })
  );

  if (!jobResult.JobId) {
    return response(500, {
      message: "failed",
      i18n: "lesson.analyze.failed",
    });
  }

  const res = await app.db.updateLesson(lessonId, {
    keyPhrasesJobId: jobResult.JobId,
  });

  if (!res) {
    return response(500, {
      message: "failed",
      i18n: "lesson.analyze.saveFailed",
    });
  }

  return response(200, {
    message: "success",
    i18n: "lesson.analyze.success",
  });
};

export default {
  GET,
  POST,
} as Route;
