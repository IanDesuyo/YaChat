import { S3EventRecord } from "aws-lambda";
import { Db, ObjectId } from "mongodb";
import { TextractClient } from "@aws-sdk/client-textract";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import * as tar from "tar";
import * as fs from "fs";
import { DetectKeyPhrasesResponse } from "@aws-sdk/client-comprehend";

const keyRegex = /transcription_result\/([0-9a-f]{24})\/(.*)\/output\/output\.tar\.gz/;

/**
 * Un zip comprehend result and save the result to db.
 * @param event S3 event
 * @param db MongoDB instance
 */
const handler = async (record: S3EventRecord, app: { db: Db; textractClient: TextractClient; s3: S3Client }) => {
  const bucket = record.s3.bucket.name;
  const key = record.s3.object.key;

  const regexRes = keyRegex.exec(key);
  if (!regexRes) {
    console.error(`Invalid key: ${key}`);
  }

  const [, lessonId, comprehendTaskKey] = regexRes;
  const outputFolder = `/tmp/${comprehendTaskKey}`;

  fs.mkdirSync(outputFolder, { recursive: true });

  const getObjectCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const body = await app.s3.send(getObjectCommand).then(data => data.Body as Readable);
  const tarStream = tar.x({ cwd: outputFolder });

  body.pipe(tarStream);

  tarStream.on("finish", async () => {
    const result = JSON.parse(await fs.readFileSync(`${outputFolder}/output`).toString()) as DetectKeyPhrasesResponse;

    const keypharses = [];
    for (const keyphrase of result.KeyPhrases) {
      if (keyphrase.Score > 0.75) {
        keypharses.push({
          text: keyphrase.Text,
          score: keyphrase.Score,
        });
      }
    }

    const res = await app.db.collection("lessons").updateOne(
      {
        _id: new ObjectId(lessonId),
      },
      {
        $set: {
          keyPhrases: keypharses,
        },
      }
    );

    console.log("success", lessonId, comprehendTaskKey, res.modifiedCount);
  });
};

export default handler;
