import { S3Event } from "aws-lambda";
import { Db } from "mongodb";
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const textractClient = new TextractClient({
  region: process.env.AWS_REGION,
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

const keyRegex =
  /uploads\/notes\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/;

/**
 * Run Textract and save the result to db and S3.
 * @param event S3 event
 * @param db MongoDB instance
 */
const handler = async (event: S3Event, db: Db) => {
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

    const textractResult = await textractClient.send(textractCommand);
    const res = await db.collection("notes").updateOne(
      {
        key: folderKey,
        "files.key": fileKey,
      },
      {
        $set: {
          "files.$.textractResult": textractResult.Blocks,
        },
      }
    );

    const content = textractResult.Blocks.map(block => block.Text).join("\n");

    const s3Command = new PutObjectCommand({
      Bucket: bucket,
      Key: `textract_result/notes/${folderKey}/${fileKey}`,
      Body: content,
      ContentType: "text/plain",
    });

    const s3Result = await s3Client.send(s3Command);

    console.log("success", folderKey, fileKey, res.modifiedCount, s3Result.ETag);
  }
};

export default handler;
