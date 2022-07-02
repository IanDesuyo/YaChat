import { Box, useToast } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { AuthContext } from "../provider/AuthProvider";

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

interface IRecorderProps {
  serverUrl: string;
}

const Recorder = ({ serverUrl }: IRecorderProps) => {
  const auth = useContext(AuthContext);
  const toast = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [ws, setWs] = useState<WebSocket>();

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const mediaStreamSource = audioContext.createMediaStreamSource(stream);
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

    const ws = new WebSocket(`${serverUrl}&sampleRate=${audioContext.sampleRate}&lang=en-US`);

    const sendChunk = (chunk: Buffer) => {
      ws.send(
        JSON.stringify({
          op: 4, // OpCodes.DATA
          d: chunk.toString("base64"),
        })
      );
    };

    // encode media stream to PCM and send to server
    scriptProcessor.onaudioprocess = e => {
      const chunk = e.inputBuffer.getChannelData(0);
      const pcm = pcmEncodeChunk(chunk);
      sendChunk(pcm);
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
            d: await auth.getCurrentToken(),
          })
        );
      }

      if (
        data.op === 3 // OpCodes.AUTH_SUCCESS
      ) {
        scriptProcessor.connect(audioContext.destination);
        mediaStreamSource.connect(scriptProcessor);
        setIsRecording(true);
      }
    });

    ws.addEventListener("close", () => {
      scriptProcessor.disconnect();
      mediaStreamSource.disconnect();
      stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    });

    setWs(ws);
  };

  const stop = () => {
    if (ws) {
      ws.close();
      setWs(undefined);
    }
  };

  return (
    <Box w="100%" minH="96px" borderRadius="xl" bg="GrayText">
      {isRecording ? <button onClick={stop}>Stop</button> : <button onClick={start}>Start</button>}
    </Box>
  );
};

export default Recorder;
