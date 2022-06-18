import * as express from "express";
import { createServer, IncomingMessage } from "http";
import { parse } from "url";
import { WebSocketServer, WebSocket } from "ws";
import ProxyTranscribe from "./proxyTranscribe";

const app = express();
const server = createServer(app);
const wsServer = new WebSocketServer({ noServer: true });

const lessons: { [key: string]: ProxyTranscribe } = {};

wsServer.on("connection", (ws: WebSocket, request: IncomingMessage, lid: string) => {
  if (lid in lessons) {
    lessons[lid].close();
  }

  lessons[lid] = new ProxyTranscribe(ws, lid);
});

server.on("upgrade", (request, socket, head) => {
  const { pathname, query } = parse(request.url, true);
  // const { authorization } = request.headers;
  const authorization = "A";
  const lid = query.lid;
  console.log(pathname, lid, authorization);

  if (pathname === "/transcribe") {
    if (!authorization) {
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      return socket.destroy();
    }

    if (!lid) {
      socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
      return socket.destroy();
    }

    wsServer.handleUpgrade(request, socket, head, ws => {
      wsServer.emit("connection", ws, request, lid);
    });
  } else {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
  }
});

server.listen(8080, () => {
  console.log("Listening on port 8080");
});
