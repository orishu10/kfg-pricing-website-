// Minimal, dependency-free .xlsx (OOXML) writer.
// Produces a genuine Excel file from a header row + data rows, packaged as a
// "stored" (uncompressed) ZIP. We only ever WRITE our own data here.

export type CellValue = string | number | null | undefined;

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

const crc32 = (buf: Uint8Array): number => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const enc = (s: string): Uint8Array => new TextEncoder().encode(s);

const xmlEsc = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const colLetter = (n: number): string => {
  let s = '';
  let i = n + 1;
  while (i > 0) {
    const m = (i - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
};

const cellXml = (ref: string, val: CellValue): string => {
  if (typeof val === 'number' && Number.isFinite(val)) {
    return `<c r="${ref}"><v>${val}</v></c>`;
  }
  const text = val == null ? '' : String(val);
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEsc(text)}</t></is></c>`;
};

const sheetXml = (headers: CellValue[], rows: CellValue[][]): string => {
  const rowsXml = [
    `<row r="1">${headers.map((h, c) => cellXml(`${colLetter(c)}1`, h)).join('')}</row>`,
  ];
  rows.forEach((row, r) => {
    const cells = row.map((v, c) => cellXml(`${colLetter(c)}${r + 2}`, v)).join('');
    rowsXml.push(`<row r="${r + 2}">${cells}</row>`);
  });
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    `<sheetData>${rowsXml.join('')}</sheetData></worksheet>`
  );
};

interface ZipFile {
  name: string;
  data: Uint8Array;
}

const zipStore = (files: ZipFile[]): Uint8Array => {
  const out: number[] = [];
  const push16 = (v: number) => out.push(v & 0xff, (v >>> 8) & 0xff);
  const push32 = (v: number) =>
    out.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  const pushBytes = (b: Uint8Array) => {
    for (let i = 0; i < b.length; i++) out.push(b[i]);
  };

  const central: { nameBytes: Uint8Array; crc: number; size: number; offset: number }[] = [];

  files.forEach((f) => {
    const nameBytes = enc(f.name);
    const crc = crc32(f.data);
    const offset = out.length;
    push32(0x04034b50); // local file header signature
    push16(20); push16(0); push16(0); push16(0); push16(0); // ver, flags, method, time, date
    push32(crc); push32(f.data.length); push32(f.data.length); // crc, comp size, uncomp size
    push16(nameBytes.length); push16(0); // name len, extra len
    pushBytes(nameBytes);
    pushBytes(f.data);
    central.push({ nameBytes, crc, size: f.data.length, offset });
  });

  const cdStart = out.length;
  central.forEach((c) => {
    push32(0x02014b50); // central directory header signature
    push16(20); push16(20); push16(0); push16(0); push16(0); push16(0);
    push32(c.crc); push32(c.size); push32(c.size);
    push16(c.nameBytes.length); push16(0); push16(0);
    push16(0); push16(0); push32(0); push32(c.offset);
    pushBytes(c.nameBytes);
  });
  const cdSize = out.length - cdStart;

  push32(0x06054b50); // end of central directory signature
  push16(0); push16(0);
  push16(central.length); push16(central.length);
  push32(cdSize); push32(cdStart); push16(0);

  return Uint8Array.from(out);
};

export const buildXlsx = (
  sheetName: string,
  headers: CellValue[],
  rows: CellValue[][],
): Uint8Array => {
  const name = xmlEsc(sheetName.slice(0, 31) || 'Sheet1');
  const files: ZipFile[] = [
    {
      name: '[Content_Types].xml',
      data: enc(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
          '<Default Extension="xml" ContentType="application/xml"/>' +
          '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
          '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
          '</Types>',
      ),
    },
    {
      name: '_rels/.rels',
      data: enc(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
          '</Relationships>',
      ),
    },
    {
      name: 'xl/workbook.xml',
      data: enc(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
          `<sheets><sheet name="${name}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
      ),
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: enc(
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
          '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
          '</Relationships>',
      ),
    },
    { name: 'xl/worksheets/sheet1.xml', data: enc(sheetXml(headers, rows)) },
  ];
  return zipStore(files);
};

// --- Reading -----------------------------------------------------------------

interface ZipEntry {
  method: number;
  offset: number; // start of the entry's data bytes
  size: number; // compressed size
}

// Locate every file in the ZIP via its central directory (the authoritative index).
const locateEntries = (buf: Uint8Array): Map<string, ZipEntry> => {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const u16 = (o: number) => dv.getUint16(o, true);
  const u32 = (o: number) => dv.getUint32(o, true);

  let eocd = -1;
  const min = Math.max(0, buf.length - 22 - 0xffff);
  for (let i = buf.length - 22; i >= min; i--) {
    if (u32(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Not a valid .xlsx file');

  const count = u16(eocd + 10);
  let p = u32(eocd + 16);
  const map = new Map<string, ZipEntry>();
  const dec = new TextDecoder();
  for (let n = 0; n < count; n++) {
    if (u32(p) !== 0x02014b50) break;
    const method = u16(p + 10);
    const compSize = u32(p + 20);
    const nameLen = u16(p + 28);
    const extraLen = u16(p + 30);
    const commentLen = u16(p + 32);
    const localOff = u32(p + 42);
    const name = dec.decode(buf.subarray(p + 46, p + 46 + nameLen));
    const lNameLen = u16(localOff + 26);
    const lExtraLen = u16(localOff + 28);
    map.set(name, { method, offset: localOff + 30 + lNameLen + lExtraLen, size: compSize });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return map;
};

const inflateRaw = async (bytes: Uint8Array): Promise<Uint8Array> => {
  const ds = new DecompressionStream('deflate-raw');
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

const readEntry = async (buf: Uint8Array, e: ZipEntry): Promise<Uint8Array> => {
  const slice = buf.subarray(e.offset, e.offset + e.size);
  if (e.method === 0) return slice;
  if (e.method === 8) return inflateRaw(slice);
  throw new Error('Unsupported .xlsx compression');
};

const colIndexFromRef = (ref: string): number => {
  let n = 0;
  for (let i = 0; i < ref.length; i++) {
    const ch = ref.charCodeAt(i);
    if (ch < 65 || ch > 90) break;
    n = n * 26 + (ch - 64);
  }
  return n - 1;
};

const textOf = (el: Element, tag: string): string =>
  Array.from(el.getElementsByTagName(tag))
    .map((t) => t.textContent ?? '')
    .join('');

const parseSharedStrings = (xml: string): string[] => {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  return Array.from(doc.getElementsByTagName('si')).map((si) => textOf(si, 't'));
};

const parseSheet = (xml: string, shared: string[]): string[][] => {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Malformed worksheet');

  let maxCol = 0;
  const rowMaps = Array.from(doc.getElementsByTagName('row')).map((row) => {
    const map: Record<number, string> = {};
    Array.from(row.getElementsByTagName('c')).forEach((c) => {
      const col = colIndexFromRef(c.getAttribute('r') ?? '');
      if (col < 0) return;
      const t = c.getAttribute('t');
      let text: string;
      if (t === 's') text = shared[parseInt(textOf(c, 'v') || '0', 10)] ?? '';
      else if (t === 'inlineStr') text = textOf(c, 't');
      else text = textOf(c, 'v') || textOf(c, 't');
      map[col] = text;
      if (col > maxCol) maxCol = col;
    });
    return map;
  });

  return rowMaps.map((map) => {
    const arr: string[] = [];
    for (let i = 0; i <= maxCol; i++) arr.push(map[i] ?? '');
    return arr;
  });
};

/** Parse an uploaded .xlsx File into a matrix of cell text (row 0 = header row). */
export const parseXlsx = async (file: File): Promise<string[][]> => {
  const buf = new Uint8Array(await file.arrayBuffer());
  const entries = locateEntries(buf);
  const dec = new TextDecoder();

  const sheetKey =
    [...entries.keys()].find((k) => k === 'xl/worksheets/sheet1.xml') ??
    [...entries.keys()].find((k) => /^xl\/worksheets\/.+\.xml$/.test(k));
  if (!sheetKey) throw new Error('No worksheet found in the file');

  const sheetXml = dec.decode(await readEntry(buf, entries.get(sheetKey)!));
  const ss = entries.get('xl/sharedStrings.xml');
  const shared = ss ? parseSharedStrings(dec.decode(await readEntry(buf, ss))) : [];
  return parseSheet(sheetXml, shared);
};

export const downloadXlsx = (
  filename: string,
  sheetName: string,
  headers: CellValue[],
  rows: CellValue[][],
): void => {
  const bytes = buildXlsx(sheetName, headers, rows);
  const blob = new Blob([bytes as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
