import React, { useEffect, useState } from "react";
import MediaRecorder from "opus-media-recorder";

const blobToBase64 = (blob: Blob): Promise<string> => {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise(resolve => {
    reader.onloadend = () => {
      resolve((reader.result as string).replace(/^data:audio\/ogg;base64,/, ""));
    };
  });
};

// Non-standard options
const workerOptions = {
  encoderWorkerFactory: function () {
    // UMD should be used if you don't use a web worker bundler for this.
    return new Worker("opusWorker/encoderWorker.umd.js");
  },
  OggOpusEncoderWasmPath:
    "https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/OggOpusEncoder.wasm",
  WebMOpusEncoderWasmPath:
    "https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/WebMOpusEncoder.wasm",
};

const App = () => {
  const handleStart = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const recorder = new MediaRecorder(
        stream,
        {
          audioBitsPerSecond: 8000,
          mimeType: "audio/ogg;codecs=opus",
        },
        workerOptions
      );

      const ws = new WebSocket("ws://localhost:8080/transcribe?lid=1");

      ws.onopen = () => {
        recorder.addEventListener("dataavailable", async e => {
          const b64encoded = await blobToBase64(e.data);
          console.log(b64encoded);
          ws.send(b64encoded);
          // ws.send(JSON.stringify({ AudioEvent: { AudioChunk: b64encoded } }));
        });
      };

      recorder.start(1000);
    });
  };

  return <button onClick={handleStart}>Start</button>;
};

export default App;
