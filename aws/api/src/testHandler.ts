import { handler } from ".";
import * as express from "express";
import * as bodyParser from "body-parser";
import { APIGatewayEvent } from "aws-lambda";

process.env.AWS_REGION = "us-east-1";
process.env.MONGODB_URI = "mongodb://yachat:***REMOVED***@44.204.53.21:27017";
process.env.MONGODB_DB = "YaChat";

const auth = {
  aud: "***REMOVED***",
  auth_time: "1655910143",
  "cognito:username": "***REMOVED***",
  email: "***REMOVED***",
  email_verified: "false",
  event_id: "6e3129da-7df2-410a-bdc1-576b6b34f7ec",
  exp: "Wed Jun 22 16:02:23 UTC 2022",
  iat: "Wed Jun 22 15:02:23 UTC 2022",
  iss: "https://cognito-idp.us-east-1.amazonaws.com/***REMOVED***",
  jti: "06146317-e7c3-4c2e-9310-5e1d9e3fdf7f",
  nickname: "Ian",
  origin_jti: "65fb3096-57cf-433f-ae1c-373d4a2faf89",
  sub: "***REMOVED***",
  token_use: "id",
};

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

[
  {
    path: "/course/:courseId",
    resource: "/course/{courseId}",
  },
  {
    path: "/lesson/:lessonId",
    resource: "/lesson/{lessonId}",
  },
  {
    path: "/lesson/:lessonId/stream",
    resource: "/lesson/{lessonId}/stream",
  },
].forEach(({ path, resource }) => {
  app.all(path, (req, res) => {
    const event: APIGatewayEvent = {
      body: JSON.stringify(req.body),
      headers: req.headers as any,
      multiValueHeaders: req.headers as any,
      httpMethod: req.method,
      isBase64Encoded: false,
      path: req.path,
      pathParameters: req.params,
      queryStringParameters: req.query as any,
      multiValueQueryStringParameters: req.query as any,
      stageVariables: undefined,
      requestContext: {
        authorizer: {
          claims: auth,
        },
      } as any,
      resource,
    };

    handler(event)
      .then(result => {
        res.status(result.statusCode).json(JSON.parse(result.body));
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      });
  });
});

app.all(["/courses", "/course", "/lesson"], (req, res) => {
  const event: APIGatewayEvent = {
    body: JSON.stringify(req.body),
    headers: req.headers as any,
    multiValueHeaders: req.headers as any,
    httpMethod: req.method,
    isBase64Encoded: false,
    path: req.path,
    pathParameters: req.params,
    queryStringParameters: req.query as any,
    multiValueQueryStringParameters: req.query as any,
    stageVariables: undefined,
    requestContext: {
      authorizer: {
        claims: auth,
      },
    } as any,
    resource: req.path,
  };

  handler(event)
    .then(result => {
      res.status(result.statusCode).json(JSON.parse(result.body));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

app.listen(3001, () => {
  console.log("Listening on port 3001");
});
