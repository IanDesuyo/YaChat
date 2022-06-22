import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
  StartStreamTranscriptionCommandOutput,
} from "@aws-sdk/client-transcribe-streaming";
import { S3Client, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { WebSocket } from "ws";
import jwtVerify from "./jwtVerify";

const transcribeStreaming = new TranscribeStreamingClient({
  region: "us-east-1",
});

const s3 = new S3Client({
  region: "us-east-1",
});

const s3Bucket = "yachat";

class ProxyTranscribe {
  ws: WebSocket;
  lid: string;
  sampleRate: string;
  lang: string;
  payload: string[];
  nextKey: number;
  userId: string;

  constructor(ws: WebSocket, lid: string, sampleRate: string, lang: string) {
    this.ws = ws;
    this.lid = lid;
    this.sampleRate = sampleRate;
    this.lang = lang;
    this.payload = [];
    this.getNextTranscriptionKey().then(count => {
      this.nextKey = count;
    });

    this.ws.onerror = this.errorHandler.bind(this);
    this.ws.onclose = this.closeHandler.bind(this);

    this.ws.once("message", async (data: string) => {
      const payload = JSON.parse(data);

      if (
        payload.op === 2 // OpCodes.AUTH
      ) {
        const res = await jwtVerify(payload.d);

        if (res.isValid) {
          console.log(`claim confirmed for ${res.userName}`);
          this.userId = res.userName;

          this.ws.send(
            JSON.stringify({
              op: 3, // OpCodes.AUTH_SUCCESS
              msg: "auth success",
            })
          );

          return this.start(ws);
        }
      }

      this.ws.send(
        JSON.stringify({
          op: 42, // OpCodes.AUTH_FAILED
          msg: "auth failed",
        })
      );
      ws.close();
    });

    this.ws.send(
      JSON.stringify({
        op: 1, // OpCodes.CONNECTED
        msg: "client connected",
      })
    );
  }

  start(ws: WebSocket) {
    const audioStream = async function* () {
      for await (const chunk of WebSocket.createWebSocketStream(ws)) {
        const payload = JSON.parse(chunk.toString());

        if (
          payload.op === 4 // OpCodes.DATA
        ) {
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

  async getNextTranscriptionKey() {
    const command = new ListObjectsV2Command({
      Bucket: s3Bucket,
      Prefix: `transcriptions/${this.lid}/`,
    });

    const result = await s3.send(command);

    console.log("getNextTranscriptionKey", this.lid, result.KeyCount);
    return result.KeyCount; // the folder is a key
  }

  async resultHandler(res: StartStreamTranscriptionCommandOutput) {
    for await (const event of res.TranscriptResultStream) {
      if (event.TranscriptEvent) {
        const message = event.TranscriptEvent;
        // Get multiple possible results
        const results = event.TranscriptEvent.Transcript.Results;
        // Print all the possible transcripts
        results.map(result => {
          if (!result.IsPartial) {
            const transcript = result.Alternatives.map(alternative => alternative.Transcript).join(
              "\n"
            );

            this.addTranscription(transcript);

            this.ws.send(
              JSON.stringify({
                op: 5, // OpCodes.TRANSCRIPT
                d: transcript,
              })
            );
          }
        });
      }
    }
  }

  addTranscription(payload: string) {
    this.payload.push(payload);

    console.log("addTranscription", this.lid, payload);
    if (this.payload.length >= 100) {
      this.saveTranscription(this.payload.join(" "));
      this.payload = [];
    }
  }

  saveTranscription(transcription: string) {
    const key = `transcriptions/${this.lid}/${this.nextKey}.txt`;
    const command = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: key,
      Body: transcription,
      Tagging: `userId=${this.userId}`,
    });

    s3.send(command)
      .then(res => {
        console.log("saveTranscription", `${this.lid} saved to ${key}`);
        this.nextKey++;
      })
      .catch(err => {
        console.log("saveTranscription", `${this.lid} error: ${err}`);
      });
  }

  closeHandler() {
    console.log(`${this.lid} disconnected`);

    if (this.payload.length > 0) {
      this.saveTranscription(this.payload.join(" "));
    }
  }

  errorHandler(err: Error) {
    console.log(`${this.lid} error: ${err}`);
  }
}

export default ProxyTranscribe;
