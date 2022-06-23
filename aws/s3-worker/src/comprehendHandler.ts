import { S3Event } from "aws-lambda";
import { Db } from "mongodb";

const keyRegex =
  /comprehend_result\/notes\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/output\.tar\.gz/;

/**
 * Extract Comprehend result and save to db.
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

    const [, folderKey] = regexRes;

    // TODO: getObject and extract it to a buffer(?
  }
};

export default handler;
