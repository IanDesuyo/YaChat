import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import MicrophoneStream from "microphone-stream";
import {
  TranscribeStreamingClient,
  StartStreamTranscriptionCommand,
  TranscriptResultStream,
} from "@aws-sdk/client-transcribe-streaming";

window.Buffer = Buffer;

const client = new TranscribeStreamingClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
});

const pcmEncodeChunk = (chunk: Buffer) => {
  const input = MicrophoneStream.toRaw(chunk);
  var offset = 0;
  var buffer = new ArrayBuffer(input.length * 2);
  var view = new DataView(buffer);
  for (var i = 0; i < input.length; i++, offset += 2) {
    var s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return Buffer.from(buffer);
};

const App = () => {
  const handleStart = async () => {
    const micStream = new MicrophoneStream();

    micStream.setStream(
      await window.navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      })
    );

    const audioStream = async function* () {
      for await (const chunk of micStream as any) {
        yield {
          AudioEvent: {
            AudioChunk:
              pcmEncodeChunk(chunk) /* pcm Encoding is optional depending on the source */,
          },
        };
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
    client.send(command).then(async response => {
      console.log(response);
      for await (const event of response.TranscriptResultStream as AsyncIterable<TranscriptResultStream>) {
        if (event.TranscriptEvent) {
          const message = event.TranscriptEvent;
          // Get multiple possible results
          const results = event.TranscriptEvent.Transcript?.Results;
          // Print all the possible transcripts
          results?.forEach(result => {
            (result.Alternatives || []).forEach(alternative => {
              const transcript = alternative.Items?.map(item => item.Content).join(" ");
              console.log(transcript);
            });
          });
        }
      }
    });
  };

  return <button onClick={handleStart}>Start</button>;
};

export default App;
