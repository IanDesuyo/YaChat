import React, { useEffect, useState } from "react";
import MicrophoneStream from "microphone-stream";
import { Buffer } from "buffer";

window.Buffer = Buffer;

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
    const ws = new WebSocket("ws://localhost:8080/transcribe?lid=1");
    const micStream = new MicrophoneStream();

    micStream.setStream(
      await window.navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      })
    );

    const audioStream = async function () {
      for await (const chunk of micStream as any as Iterable<Buffer>) {
        ws.send(
            pcmEncodeChunk(chunk) /* pcm Encoding is optional depending on the source */
        );
      }
    };

    audioStream();
  };

  return <button onClick={handleStart}>Start</button>;
};

export default App;
