// Simple extraction for a quick test.
function chunkTextTest(text, size = 500, overlap = 50) {
  const chunks = [];
  let index = 0;
  while (index < text.length) {
    chunks.push(text.slice(index, index + size));
    index += size - overlap;
  }
  return chunks;
}

const longText = "a".repeat(1200);
const chunks = chunkTextTest(longText, 500, 50);

console.log(`Text length: ${longText.length}`);
console.log(`Chunks count: ${chunks.length}`);
console.log(`Chunk 1 length: ${chunks[0].length}`);
console.log(`Chunk 2 length: ${chunks[1].length}`);

if (chunks.length === 3 && chunks[0].length === 500) {
  console.log("Chunking test PASSED");
} else {
  console.log("Chunking test FAILED");
  process.exit(1);
}
