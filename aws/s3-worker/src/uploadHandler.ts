import { S3Event } from "aws-lambda";
import { Db } from "mongodb";
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";

const keyRegex =
  /uploads\/notes\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/;

/**
 * Run Textract and save the result to db and S3.
 * @param event S3 event
 * @param db MongoDB instance
 */
const handler = async (event: S3Event, app: { db: Db; textractClient: TextractClient }) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;

    const regexRes = keyRegex.exec(key);
    if (!regexRes) {
      console.error(`Invalid key: ${key}`);
    }

    const [, folderKey, fileKey] = regexRes;

    const textractCommand = new DetectDocumentTextCommand({
      Document: {
        S3Object: {
          Bucket: bucket,
          Name: key,
        },
      },
    });

    const textractResult = await app.textractClient.send(textractCommand);

    const content = textractResult.Blocks.map(block => block.Text).join("\n");

    const res = await app.db.collection("notes").updateOne(
      {
        key: folderKey,
        "files.key": fileKey,
      },
      {
        $set: {
          "files.$.textractResult": textractResult.Blocks,
          "files.$.textractContent": content,
        },
      }
    );

    console.log("success", folderKey, fileKey, res.modifiedCount);
  }
};

export default handler;
