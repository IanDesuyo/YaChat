import { S3EventRecord } from "aws-lambda";
import { Db } from "mongodb";
import { TextractClient } from "@aws-sdk/client-textract";

/**
 * Un zip comprehend result and save the result to db.
 * @param event S3 event
 * @param db MongoDB instance
 */
const handler = async (record: S3EventRecord, app: { db: Db; textractClient: TextractClient }) => {
  const bucket = record.s3.bucket.name;
  const key = record.s3.object.key;
};

export default handler;
