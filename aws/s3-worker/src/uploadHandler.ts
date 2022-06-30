import { S3EventRecord } from "aws-lambda";
import { Db } from "mongodb";
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";

const keyRegex =
  /uploads\/notes\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/;

/**
 * Run Textract and save the result to db and S3.
 * @param event S3 event
 * @param db MongoDB instance
 */
const handler = async (record: S3EventRecord, app: { db: Db; textractClient: TextractClient }) => {
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

  const blocks = textractResult.Blocks.filter(block => ["WORD", "LINE"].includes(block.BlockType)).map(block => ({
    text: block.Text,
    type: block.BlockType,
    confidence: block.Confidence,
    boundingBox: {
      top: block.Geometry.BoundingBox.Top,
      left: block.Geometry.BoundingBox.Left,
      height: block.Geometry.BoundingBox.Height,
      width: block.Geometry.BoundingBox.Width,
    },
    id: block.Id,
    relationships: block.Relationships?.map(relationship => ({
      type: relationship.Type,
      ids: relationship.Ids,
    })),
  }));

  const content = textractResult.Blocks.filter(block => block.BlockType == "LINE")
    .map(block => block.Text)
    .join("\n");

  const res = await app.db.collection("notes").updateOne(
    {
      key: folderKey,
      "files.key": key,
    },
    {
      $set: {
        "files.$.textractResult": blocks,
        "files.$.textractContent": content,
      },
    }
  );

  console.log("success", folderKey, fileKey, res.modifiedCount);
  return;
};

export default handler;
