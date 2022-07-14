import { Db, MongoClient } from "mongodb";
import { S3Event } from "aws-lambda";
import uploadHandler from "./uploadHandler";
import comprehendHandler from "./comprehendHandler";
import { TextractClient } from "@aws-sdk/client-textract";
import { S3Client } from "@aws-sdk/client-s3";

const textractClient = new TextractClient({
  region: process.env.AWS_REGION,
});

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

var dbCache: Db;
/**
 * Get db instance from cache or create a new one.
 * @returns MongoDB instance
 */
const getDB = async () => {
  if (dbCache) {
    return dbCache;
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db(process.env.MONGODB_DB);

  dbCache = db;

  return dbCache;
};

export const handler = async (event: S3Event) => {
  const db = await getDB();

  for (const record of event.Records) {
    const key = record.s3.object.key;

    console.log(`Processing ${key}`);

    if (key.startsWith("uploads/notes/")) {
      await uploadHandler(record, { db, textractClient, s3 });
    } else if (key.startsWith("transcription_result/")) {
      await comprehendHandler(record, { db, textractClient, s3 });
    } else {
      console.warn(`Should not be triggered by ${key}`);
    }
  }
};
