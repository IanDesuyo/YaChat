import { useEffect, useRef, useState } from "react";
import WordCloudJS, { Dimension, ListEntry, Options } from "wordcloud";

interface IWorldCloudProps {
  words: [string, number][];
  onClick?: (item: ListEntry, dimension: Dimension, event: MouseEvent) => void;
  options?: Options;
  useDiv?: boolean;
  [key: string]: any;
}

const WordCloudBox = ({ words, onClick, options, useDiv, ...props }: IWorldCloudProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardDivRef = useRef<HTMLDivElement>(null);
  const boardCanvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      setSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
  }, [containerRef]);

  useEffect(() => {
    const elements: HTMLElement[] = [];

    [boardCanvasRef, boardDivRef].forEach(ref => {
      if (ref.current) {
        elements.push(ref.current);
      }
    });

    if (WordCloudJS.isSupported && elements.length > 0) {
      WordCloudJS(elements, {
        rotateRatio: 0,
        gridSize: Math.round((16 * size.width) / 1024),
        weightFactor: function (s) {
          if (boardCanvasRef.current) return (Math.pow(s, 1) * size.width) / 32;
          return 2;
        },
        fontFamily: "Noto Sans TC, sans-serif",
        backgroundColor: "transparent",
        ...options,
        list: words,
        click: onClick,
      });
    }
  }, [onClick, options, size.width, words]);

  return (
    <div {...props} ref={containerRef}>
      <canvas
        ref={boardCanvasRef}
        width={size.width}
        height={size.height}
        style={useDiv ? { display: "none" } : undefined}
      />
      {useDiv && <div ref={boardDivRef} />}
    </div>
  );
};

export default WordCloudBox;
