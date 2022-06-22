# Transcribe Proxy

Because the Amazon Transcribe streaming only sends results back to the source,
so this is a WebSocket proxy that can saves the results to S3.

Note that `getUserMedia` is only supported by [some browsers](https://caniuse.com/stream).

## Install

1. Run `npm install`
2. Run `npm run build` to build the dist folder
3. Set the `COGNITO_POOL_ID` and `S3_BUCKET` environment variables
4. Run `npm run start` to start the server

## Usage

Before we start, read the [OP Codes](OPCodes.md) section to understand the OP Codes we use in the WebSocket.

First, get the audio stream and create an AudioContext and ScriptProcessor.

```ts
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const audioContext = new AudioContext();
const mediaStreamSource = audioContext.createMediaStreamSource(stream);
const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
// I know this function is deprecated, but it works
```

And convert the audio stream to PCM.

```ts
const pcmEncodeChunk = (chunk: Float32Array) => {
  var offset = 0;
  var buffer = new ArrayBuffer(chunk.length * 2);
  var view = new DataView(buffer);
  for (var i = 0; i < chunk.length; i++, offset += 2) {
    var s = Math.max(-1, Math.min(1, chunk[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return Buffer.from(buffer);
};

scriptProcessor.onaudioprocess = e => {
  const chunk = e.inputBuffer.getChannelData(0);
  const pcm = pcmEncodeChunk(chunk);
  sendChunk(pcm);
};
```

Then, define the `sendChunk` function and WebSocket connection.

The `lid` is used to identify the connection, and there can be only one connection at the same time.

```ts
const ws = new WebSocket(`ws://<YOUR_SERVER>/transcribe?lid=<LID>&sampleRate=${audioContext.sampleRate}&lang=en-US`);

const sendChunk = (chunk: Buffer) => {
  ws.send(
    JSON.stringify({
      op: 4, // OpCodes.DATA
      d: chunk.toString("base64"),
    })
  );
};

ws.addEventListener("message", async e => {
  const data = JSON.parse(e.data);
  console.log(data);

  if (
    data.op === 1 // OpCodes.CONNECTED
  ) {
    ws.send(
      JSON.stringify({
        op: 2, // OpCodes.AUTH
        d: "<COGNITO_TOKEN>",
      })
    );
  }

  if (
    data.op === 3 // OpCodes.AUTH_SUCCESS
  ) {
    scriptProcessor.connect(audioContext.destination);
    mediaStreamSource.connect(scriptProcessor);
  }
});

// Stop the AudioContext and ScriptProcessor when the connection closed
ws.addEventListener("close", () => {
  scriptProcessor.disconnect();
  mediaStreamSource.disconnect();
  stream.getTracks().forEach(track => track.stop());
});
```

You should see the results saved at `s3://<S3_BUCKET>/transcriptions/<LID>/<INCREASE_INDEX>.txt`
