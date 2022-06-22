import { App } from "../../../types";
import Route from "../../../types/route";
import { APIGatewayProxyEventBase, APIGatewayProxyCognitoAuthorizer } from "aws-lambda";
import response from "../../../utils/response";
import { parseObjectId } from "../../../utils/parser";
import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";

const GET = async (app: App, event: APIGatewayProxyEventBase<APIGatewayProxyCognitoAuthorizer>) => {
  const lessonId = parseObjectId(event.pathParameters.lessonId);

  const lesson = await app.db.getLesson(lessonId);

  if (!lesson) {
    return response(404, {
      message: "not found",
      i18n: "lesson.notFound",
    });
  }

  const res = await app.ec2.send(
    new DescribeInstancesCommand({
      Filters: [
        {
          Name: "tag:YaChat",
          Values: ["stream"],
        },
      ],
    })
  );

  const instanceIPs: string[] = [];

  res.Reservations.forEach(r => {
    r.Instances.forEach(i => {
      if (i.PublicDnsName) {
        // use dns name for better compatibility
        instanceIPs.push(i.PublicDnsName);
      }
    });
  });

  const randomInstanceIP = instanceIPs[Math.floor(Math.random() * instanceIPs.length)];

  return response(200, {
    message: "success",
    i18n: "stream.get.success",
    data: `wss://${randomInstanceIP}/transcribe?lid=${lessonId}`,
  });
};

export default {
  GET,
} as Route;
