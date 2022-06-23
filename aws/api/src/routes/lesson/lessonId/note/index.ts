import { App } from "types";
import Route from "types/route";
import { APIGatewayEvent } from "aws-lambda";
import response from "utils/response";
import { NoteCreate, NoteFile } from "types/model";
import { parseObjectId } from "utils/parser";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const POST = async (app: App, event: APIGatewayEvent) => {
  const lessonId = parseObjectId(event.pathParameters.lessonId);
  const payload = JSON.parse(event.body) as NoteCreate;

  const lesson = await app.db.getLesson(lessonId);

  if (!lesson) {
    return response(404, {
      message: "not found",
      i18n: "lesson.notFound",
    });
  }

  const folderKey = uuidv4();
  const files: NoteFile[] = [];
  const preSignedUrls: string[] = [];

  for (const file of payload.files) {
    const key = `uploads/notes/${folderKey}/${uuidv4()}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: file.type,
    });

    const preSignedUrl = await getSignedUrl(app.s3, command, {
      expiresIn: 36000, // TODO: 10 hours for development, change to 10 mins for production
    });

    files.push({ key });
    preSignedUrls.push(preSignedUrl);
  }

  const noteId = await app.db.createNote({
    lessonId,
    nickname: payload.nickname,
    key: folderKey,
    files,
    createdAt: new Date(),
  });

  return response(200, {
    message: "success",
    i18n: "course.create.success",
    data: {
      noteId,
      uploadUrls: preSignedUrls,
    },
  });
};

export default {
  POST,
} as Route;
