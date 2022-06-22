import { Db } from "mongodb";
import { S3 } from "aws-sdk";

export const enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export interface App {
  db: Db;
  s3: S3;
}
