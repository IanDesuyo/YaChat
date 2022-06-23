import { S3Client } from "@aws-sdk/client-s3";
import { EC2Client } from "@aws-sdk/client-ec2";
import { ComprehendClient } from "@aws-sdk/client-comprehend";
import DBManager from "../utils/dbManager";

export const enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export interface App {
  db: DBManager;
  s3: S3Client;
  ec2: EC2Client;
  comprehend: ComprehendClient;
}
