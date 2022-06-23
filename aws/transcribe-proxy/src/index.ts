import * as express from "express";
import { createServer } from "http";
import { parse } from "url";
import { WebSocket } from "ws";
import ProxyTranscribe from "./proxyTranscribe";
import { LanguageCode } from "@aws-sdk/client-transcribe-streaming";
import "./env";

const app = express();
const server = createServer(app);
const wsServer = new WebSocket.Server({ noServer: true, perMessageDeflate: false });

const lessons: { [key: string]: ProxyTranscribe } = {};

wsServer.on("connection", (ws: WebSocket, lid: string, sampleRate: string, lang: string) => {
  if (lid in lessons) {
    lessons[lid].ws.send(JSON.stringify({ op: OpCodes.ANOTHER_CLIENT_CONNECTED, msg: "another client connected" }));
    lessons[lid].ws.close();
  }

  lessons[lid] = new ProxyTranscribe(ws, lid, sampleRate, lang);
});

server.on("upgrade", (request, socket, head) => {
  const { pathname, query } = parse(request.url, true);
  const lid = query.lid;
  const sampleRate = parseInt(query.sampleRate.toString());
  const lang = query.lang as LanguageCode;

  if (pathname === "/transcribe") {
    if (!lid || !sampleRate) {
      socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
      return socket.destroy();
    }

    wsServer.handleUpgrade(request, socket, head, ws => {
      wsServer.emit("connection", ws, lid, sampleRate, lang);
    });
  } else {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
  }
});

server.listen(8080, () => {
  console.log("Listening on port 8080");
});
