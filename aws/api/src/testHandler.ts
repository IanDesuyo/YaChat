import { handler } from ".";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import { APIGatewayEvent } from "aws-lambda";

process.env.AWS_REGION = "us-east-1";
process.env.AWS_JOB_ARN = "arn:aws:iam::000000000000:role/YaChat";
process.env.AWS_S3_BUCKET = "yachat";
process.env.MONGODB_URI = "mongodb://user:pass@127.0.0.1:27017";
process.env.MONGODB_DB = "YaChat";

const auth = {
  aud: "XXXXXXXXXXXXXXXXXXXXXXXXXX",
  auth_time: "0",
  "cognito:username": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  email: "test@example.com",
  email_verified: "false",
  event_id: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  exp: "Thu Jan 01 00:00:00 UTC 1970",
  iat: "Thu Jan 01 00:00:00 UTC 1970",
  iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX",
  jti: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  nickname: "Ian",
  origin_jti: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  sub: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
  token_use: "id",
};

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
[
  {
    path: "/",
    resource: "/",
  },
  {
    path: "/courses",
    resource: "/courses",
  },
  {
    path: "/course",
    resource: "/course",
  },
  {
    path: "/course/:courseId",
    resource: "/course/{courseId}",
  },
  {
    path: "/lesson",
    resource: "/lesson",
  },
  {
    path: "/lesson/:lessonId",
    resource: "/lesson/{lessonId}",
  },
  {
    path: "/lesson/:lessonId/stream",
    resource: "/lesson/{lessonId}/stream",
  },
  {
    path: "/lesson/:lessonId/analyze",
    resource: "/lesson/{lessonId}/analyze",
  },
  {
    path: "/lesson/:lessonId/notes",
    resource: "/lesson/{lessonId}/notes",
  },
  {
    path: "/lesson/:lessonId/note",
    resource: "/lesson/{lessonId}/note",
  },
  {
    path: "/lesson/:lessonId/note/:noteId",
    resource: "/lesson/{lessonId}/note/{noteId}",
  },
  {
    path: "/lesson/:lessonId/note/:noteId/status",
    resource: "/lesson/{lessonId}/note/{noteId}/status",
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

app.listen(3001, () => {
  console.log("Listening on port 3001");
});
