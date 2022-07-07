import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
  StartStreamTranscriptionCommandOutput,
} from "@aws-sdk/client-transcribe-streaming";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { WebSocket } from "ws";
import jwtVerify from "./jwtVerify";

const transcribeStreaming = new TranscribeStreamingClient({
  region: "us-east-1",
});

const s3 = new S3Client({
  region: "us-east-1",
});

class ProxyTranscribe {
  ws: WebSocket;
  lid: string;
  sampleRate: string;
  lang: string;
  payload: string[];
  userId: string;

  constructor(ws: WebSocket, lid: string, sampleRate: string, lang: string) {
    this.ws = ws;
    this.lid = lid;
    this.sampleRate = sampleRate;
    this.lang = lang;
    this.payload = [];
    this.loadTranscription();

    this.ws.onerror = this.errorHandler.bind(this);
    this.ws.onclose = this.closeHandler.bind(this);

    this.ws.once("message", async (data: string) => {
      const payload = JSON.parse(data);

      if (payload.op === OpCodes.AUTH) {
        const res = await jwtVerify(payload.d);

        if (res.isValid) {
          console.log(`claim confirmed for ${res.userName}`);
          this.userId = res.userName;

          this.ws.send(
            JSON.stringify({
              op: OpCodes.AUTH_SUCCESS,
              msg: "auth success",
            })
          );

          return this.start(ws);
        }
      }

      this.ws.send(
        JSON.stringify({
          op: OpCodes.AUTH_FAILED,
          msg: "auth failed",
        })
      );
      ws.close();
    });

    this.ws.send(
      JSON.stringify({
        op: OpCodes.CONNECTED,
        msg: "client connected",
      })
    );
  }

  start(ws: WebSocket) {
    const audioStream = async function* () {
      for await (const chunk of WebSocket.createWebSocketStream(ws)) {
        const payload = JSON.parse(chunk.toString());

        if (payload.op === OpCodes.DATA) {
          yield { AudioEvent: { AudioChunk: Buffer.from(payload.d, "base64") } };
        }
      }
    };

    const command = new StartStreamTranscriptionCommand({
      // The language code for the input audio. Valid values are en-GB, en-US, es-US, fr-CA, and fr-FR
      LanguageCode: this.lang,
      // The encoding used for the input audio. The only valid value is pcm.
      MediaEncoding: "pcm",
      // The sample rate of the input audio in Hertz. We suggest that you use 8000 Hz for low-quality audio and 16000 Hz for
      // high-quality audio. The sample rate must match the sample rate in the audio file.
      MediaSampleRateHertz: parseInt(this.sampleRate),

      AudioStream: audioStream(),
    });

    transcribeStreaming.send(command).then(this.resultHandler.bind(this));
  }

  async resultHandler(res: StartStreamTranscriptionCommandOutput) {
    for await (const event of res.TranscriptResultStream) {
      if (event.TranscriptEvent) {
        const results = event.TranscriptEvent.Transcript.Results;
        results.map(result => {
          if (!result.IsPartial) {
            const transcript = result.Alternatives.map(alternative => alternative.Transcript).join("\n");

            this.addTranscription(transcript);

            this.ws.send(
              JSON.stringify({
                op: OpCodes.TRANSCRIPT,
                d: transcript,
              })
            );
          }
        });
      }
    }
  }

  addTranscription(transcript: string) {
    this.payload.push(transcript);
  }

  async loadTranscription() {
    const key = `transcriptions/${this.lid}`;

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    });

    const result = await s3.send(command);

    if (result.Body) {
      this.payload.unshift(result.Body.toString());
    }

    console.log("loadTranscription", this.lid, this.payload.length);
  }

  async saveTranscription() {
    const key = `transcriptions/${this.lid}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: this.payload.join(" "),
      Tagging: `userId=${this.userId}`,
    });

    const result = await s3.send(command);

    if (result.ETag) {
      console.log("saveTranscription", this.lid, this.payload.length);
    } else {
      console.log("saveTranscription failed", this.lid, this.payload.length);
    }
  }

  closeHandler() {
    console.log(`${this.lid} disconnected`);

    if (this.payload.length > 0) {
      this.saveTranscription();
    }
  }

  errorHandler(err: Error) {
    console.log(`${this.lid} error: ${err}`);
  }
}

export default ProxyTranscribe;
