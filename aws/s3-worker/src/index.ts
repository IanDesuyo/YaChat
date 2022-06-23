import { Db, MongoClient } from "mongodb";
import { S3Event } from "aws-lambda";
import uploadHandler from "./uploadHandler";
import comprehendHandler from "./comprehendHandler";

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

    if (key.startsWith("uploads/notes/")) {
      uploadHandler(event, db);
    } else if (key.startsWith("comprehend_result/notes/")) {
      comprehendHandler(event, db);
    }
  }
};
