import {
  Box,
  Button,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  useToast,
  useDisclosure,
  ButtonGroup,
} from "@chakra-ui/react";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../provider/AuthProvider";
import pcmEncodeChunk from "../utils/pcmEncodeChunk";

interface IRecorderProps {
  serverUrl: string;
  isAnalyzing?: boolean;
  isAnalyzed?: boolean;
  handleAnalyze: () => void;
}

const Recorder = ({ serverUrl, isAnalyzing = false, isAnalyzed = false, handleAnalyze }: IRecorderProps) => {
  const auth = useContext(AuthContext);
  const toast = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [ws, setWs] = useState<WebSocket>();
  const [lastTranscript, setLastTranscript] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const start = async () => {
    try {
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

        if (
          data.op === 1 // OpCodes.CONNECTED
        ) {
          ws.send(
            JSON.stringify({
              op: 2, // OpCodes.AUTH
              d: await auth.getCurrentToken(),
            })
          );
        } else if (
          data.op === 3 // OpCodes.AUTH_SUCCESS
        ) {
          scriptProcessor.connect(audioContext.destination);
          mediaStreamSource.connect(scriptProcessor);
          setIsRecording(true);
        } else if (
          data.op === 5 // OpCodes.TRANSCRIPT
        ) {
          setLastTranscript(data.d);
        }
      });

      ws.addEventListener("close", () => {
        scriptProcessor.disconnect();
        mediaStreamSource.disconnect();
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      });

      setWs(ws);
    } catch (e) {
      toast({
        title: "Error",
        description: e as string,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const stop = () => {
    if (ws) {
      ws.close();
      setWs(undefined);
    }

    onOpen();
  };

  return (
    <>
      <Box w="100%" minH="120px" p={4} borderRadius="xl" bg="gray">
        <Flex justifyContent="space-between">
          <Text fontSize="xl" mb={4}>
            課堂錄音分析
          </Text>
          {isAnalyzed ? (
            <Button as={Link} to="teachercloud" colorScheme="blue">
              查看分析結果
            </Button>
          ) : isAnalyzing ? (
            <Button colorScheme="orange" disabled>
              分析中...
            </Button>
          ) : isRecording ? (
            <Button onClick={stop} colorScheme="red">
              結束錄音
            </Button>
          ) : (
            <Button onClick={start} colorScheme="green">
              開始錄音
            </Button>
          )}
        </Flex>
        <Text>{lastTranscript}</Text>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>要進行錄音分析嗎?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>讓我們協助了解您於課堂上所傳達的重點, 以便您可以更好的掌控教學進度!</ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="ghost" onClick={onClose}>
                取消
              </Button>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => {
                  handleAnalyze();
                  onClose();
                }}
              >
                開始分析
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Recorder;
