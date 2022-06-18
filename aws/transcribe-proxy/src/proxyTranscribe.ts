import { EventEmitter, on, RawData, WebSocket } from "ws";
import {
  StartStreamTranscriptionCommand,
  TranscribeStreamingClient,
} from "@aws-sdk/client-transcribe-streaming";

const client = new TranscribeStreamingClient({
  region: "us-east-1",
});

class ProxyTranscribe {
  proxy: EventEmitter;
  ws: WebSocket;
  lid: string;

  constructor(ws: WebSocket, lid: string) {
    this.proxy = new EventEmitter();

    this.ws = ws;
    this.lid = lid;

    ws.send(
      JSON.stringify({
        op: 1, // OpCodes.CONNECTED
        msg: "client connected",
      })
    );

    ws.on("close", () => this.closeHandler());
    ws.on("error", err => this.errorHandler(err));

    const audioStream = async function* () {
      for await (const chunk of on(ws, "message")) {
        console.log(chunk)
        yield { AudioEvent: { AudioChunk: chunk } };
      }
    };

    const command = new StartStreamTranscriptionCommand({
      // The language code for the input audio. Valid values are en-GB, en-US, es-US, fr-CA, and fr-FR
      LanguageCode: "en-US",
      // The encoding used for the input audio. The only valid value is pcm.
      MediaEncoding: "pcm",
      // The sample rate of the input audio in Hertz. We suggest that you use 8000 Hz for low-quality audio and 16000 Hz for
      // high-quality audio. The sample rate must match the sample rate in the audio file.
      MediaSampleRateHertz: 44100,
      
      AudioStream: audioStream(),
    });

    client
      .send(command)
      .then(async res => {
        console.log(res);
        for await (const event of res.TranscriptResultStream) {
          if (event.TranscriptEvent) {
            const message = event.TranscriptEvent;
            // Get multiple possible results
            const results = event.TranscriptEvent.Transcript.Results;
            // Print all the possible transcripts
            results.map(result => {
              (result.Alternatives || []).map(alternative => {
                const transcript = alternative.Items.map(item => item.Content).join(" ");
                console.log(transcript);
              });
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  closeHandler() {
    console.log(`${this.lid} disconnected`);
  }

  errorHandler(err: Error) {
    console.log(`${this.lid} error: ${err}`);
  }

  close() {
    this.ws.send({ op: 40, msg: "client disconnected" });
    this.ws.close();
  }
}

export default ProxyTranscribe;
