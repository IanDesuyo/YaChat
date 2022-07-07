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

export default pcmEncodeChunk;
