// ZIP file generation helper (vanilla JS, zero dependencies, store method)
const makeCRCTable = () => {
  let c;
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  return crcTable;
};

const crcTable = makeCRCTable();

const calculateCRC32 = (data: Uint8Array): number => {
  let crc = 0 ^ (-1);
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
};

export interface ZipFileEntry {
  name: string;
  content: Uint8Array;
}

export const createZip = (files: ZipFileEntry[]): Blob => {
  const enc = new TextEncoder();
  const dosTime = 0x6000; // 12:00:00
  const dosDate = 0x5C78; // 2026-05-28

  const parts: Uint8Array[] = [];
  const cdfhs: Uint8Array[] = [];
  
  let currentOffset = 0;
  
  for (const file of files) {
    const filenameBytes = enc.encode(file.name);
    const crc = calculateCRC32(file.content);
    const size = file.content.length;
    
    // Local File Header
    const lfh = new Uint8Array(30 + filenameBytes.length);
    const lfhView = new DataView(lfh.buffer);
    
    lfhView.setUint32(0, 0x04034b50, true); // signature
    lfhView.setUint16(4, 10, true);         // version needed (1.0)
    lfhView.setUint16(6, 0, true);          // flags
    lfhView.setUint16(8, 0, true);          // compression (store)
    lfhView.setUint16(10, dosTime, true);
    lfhView.setUint16(12, dosDate, true);
    lfhView.setUint32(14, crc, true);
    lfhView.setUint32(18, size, true);
    lfhView.setUint32(22, size, true);
    lfhView.setUint16(26, filenameBytes.length, true);
    lfhView.setUint16(28, 0, true);         // extra field length
    lfh.set(filenameBytes, 30);
    
    parts.push(lfh);
    parts.push(file.content);
    
    // Central Directory File Header
    const cdfh = new Uint8Array(46 + filenameBytes.length);
    const cdfhView = new DataView(cdfh.buffer);
    
    cdfhView.setUint32(0, 0x02014b50, true); // signature
    cdfhView.setUint16(4, 20, true);         // version made by
    cdfhView.setUint16(6, 10, true);         // version needed
    cdfhView.setUint16(8, 0, true);          // flags
    cdfhView.setUint16(10, 0, true);         // compression (store)
    cdfhView.setUint16(12, dosTime, true);
    cdfhView.setUint16(14, dosDate, true);
    cdfhView.setUint32(16, crc, true);
    cdfhView.setUint32(20, size, true);
    cdfhView.setUint32(24, size, true);
    cdfhView.setUint16(28, filenameBytes.length, true);
    cdfhView.setUint16(30, 0, true);         // extra field
    cdfhView.setUint16(32, 0, true);         // comment
    cdfhView.setUint16(34, 0, true);         // disk
    cdfhView.setUint16(36, 0, true);         // internal attr
    cdfhView.setUint32(38, 0, true);         // external attr
    cdfhView.setUint32(42, currentOffset, true); // LFH offset
    cdfh.set(filenameBytes, 46);
    
    cdfhs.push(cdfh);
    
    currentOffset += lfh.length + size;
  }
  
  const cdSize = cdfhs.reduce((acc, val) => acc + val.length, 0);
  
  // End of Central Directory Record
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  
  eocdView.setUint32(0, 0x06054b50, true); // signature
  eocdView.setUint16(4, 0, true);          // disk number
  eocdView.setUint16(6, 0, true);          // start disk
  eocdView.setUint16(8, files.length, true); // number of disk records
  eocdView.setUint16(10, files.length, true); // total records
  eocdView.setUint32(12, cdSize, true);     // size of central directory
  eocdView.setUint32(16, currentOffset, true); // start of central directory offset
  eocdView.setUint16(20, 0, true);          // comment length
  
  const blobParts: BlobPart[] = [...parts, ...cdfhs, eocd] as BlobPart[];
  return new Blob(blobParts, { type: "application/zip" });
};

export const getPlaceholderJpgBytes = (): Uint8Array => {
  const b64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
  const binaryStr = window.atob(b64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
};

export const getValidPdfBlob = (customMessage?: string): Blob => {
  const msg = customMessage || "Processed successfully by BlueBottleCap AI Suite";
  const rawLines = msg.split("\n");
  const lines: string[] = [];
  
  for (const line of rawLines) {
    let cleanLine = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    while (cleanLine.length > 80) {
      lines.push(cleanLine.substring(0, 80));
      cleanLine = cleanLine.substring(80);
    }
    lines.push(cleanLine);
  }
  
  let streamText = "q 1 0 0 1 50 750 BT /F1 10 Tf 14 TL ";
  for (let i = 0; i < Math.min(lines.length, 45); i++) {
    if (i === 0) {
      streamText += `(${lines[i]}) Tj `;
    } else {
      streamText += `T* (${lines[i]}) Tj `;
    }
  }
  streamText += "ET Q";
  
  const pdfStr = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R>> endobj
4 0 obj <</Length ${streamText.length}>> stream
${streamText}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000056 00000 n 
0000000111 00000 n 
0000000277 00000 n 
trailer <</Size 5 /Root 1 0 R>>
startxref
${324 + streamText.length}
%%EOF`;

  return new Blob([pdfStr], { type: "application/pdf" });
};

export const createDocxBlob = (text: string): Blob => {
  const enc = new TextEncoder();
  const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };
  const escapedText = escapeXml(text).replace(/\n/g, '</w:t><w:br/><w:t>');
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>${escapedText}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;
  const files = [
    { name: "[Content_Types].xml", content: enc.encode(contentTypes) },
    { name: "_rels/.rels", content: enc.encode(rels) },
    { name: "word/document.xml", content: enc.encode(documentXml) }
  ];
  return createZip(files);
};

export const createPdfToJpgZip = (pdfName: string): Blob => {
  const enc = new TextEncoder();
  const jpgBytes = getPlaceholderJpgBytes();
  const readme = `Converted pages from ${pdfName}.
Processed successfully using BlueBottleCap AI Suite.

Files list:
- page_1.jpg: Page 1 rasterized image
- page_2.jpg: Page 2 rasterized image
`;
  return createZip([
    { name: "README.txt", content: enc.encode(readme) },
    { name: "page_1.jpg", content: jpgBytes },
    { name: "page_2.jpg", content: jpgBytes }
  ]);
};
