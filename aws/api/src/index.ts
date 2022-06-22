import { MongoClient } from "mongodb";
import { APIGatewayEvent } from "aws-lambda";
import routes from "./routes";
import { HttpMethod } from "./types";
import corsHandler from "./utils/corsHandler";
import DBManager from "./utils/dbManager";
import response from "./utils/response";
import { S3Client } from "@aws-sdk/client-s3";
import { EC2Client } from "@aws-sdk/client-ec2";

var dbCache: DBManager;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

const ec2 = new EC2Client({
  region: process.env.AWS_REGION,
});

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

  dbCache = new DBManager(db);

  return dbCache;
};

/**
 * Get the handler function for the given event.
 * @param event - The event object
 * @returns A handler function for the event if found, otherwise null
 */
const getHandler = (event: APIGatewayEvent) => {
  const path = event.resource; // use resource to get the path without parameters like /note/{id}
  const method = event.httpMethod as HttpMethod;

  const route = routes[path];

  if (!route) {
    console.warn(`${method} ${path}: path not found`);
    return null;
  }

  const routeHandler = route[method];

  if (!routeHandler) {
    console.warn(`${method} ${path}: method not found, should be ${Object.keys(route)}`);
  }
  return routeHandler;
};

/**
 * The main function.
 * @param event - The event object
 * @returns API Gateway response object
 */
export const handler = async (event: APIGatewayEvent) => {
  console.log(`event: ${JSON.stringify(event)}`);
  if (event.httpMethod === "OPTIONS") {
    return corsHandler(event);
  }

  const db = await getDB();
  const routeHandler = getHandler(event);

  console.log(`${event.httpMethod} ${event.resource} ${event.requestContext.authorizer?.claims.sub}`);

  if (!routeHandler) {
    console.error(`${event.httpMethod} ${event.resource} not found`);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "You should never see this",
        event: {
          method: event.httpMethod,
          path: event.resource,
          body: event.body,
          queryStringParameters: event.queryStringParameters,
          pathParameters: event.pathParameters,
        },
      }),
    };
  }

  try {
    return await routeHandler({ db, s3, ec2 }, event);
  } catch (error) {
    console.error(error);
    return response(error.statusCode || 500, error.response || "Internal Server Error");
  }
};
