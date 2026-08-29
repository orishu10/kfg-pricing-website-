import { describe, it, expect } from 'vitest';
import { buildXlsx } from './xlsx';

// The ZIP entries are STORED (uncompressed), so the worksheet XML bytes appear
// verbatim in the output — we can assert on them directly.
const asText = (bytes: Uint8Array) => new TextDecoder('utf-8').decode(bytes);

describe('buildXlsx', () => {
  it('produces a ZIP (PK signature) with the expected parts', () => {
    const bytes = buildXlsx('Sheet1', ['#', 'Name'], [['001', 'Acme']]);
    expect(bytes[0]).toBe(0x50); // 'P'
    expect(bytes[1]).toBe(0x4b); // 'K'
    const text = asText(bytes);
    expect(text).toContain('xl/worksheets/sheet1.xml');
    expect(text).toContain('[Content_Types].xml');
  });

  it('writes header + data rows as cells', () => {
    const text = asText(buildXlsx('S', ['#', 'Name'], [['001', 'Acme']]));
    expect(text).toContain('<t xml:space="preserve">#</t>');
    expect(text).toContain('<t xml:space="preserve">001</t>');
    expect(text).toContain('<t xml:space="preserve">Acme</t>');
  });

  it('escapes XML-special characters', () => {
    const text = asText(buildXlsx('S', ['A & B <x>'], []));
    expect(text).toContain('A &amp; B &lt;x&gt;');
  });

  it('writes finite numbers as numeric cells and null as empty text', () => {
    const text = asText(buildXlsx('S', ['n', 'x'], [[2, null]]));
    expect(text).toContain('<v>2</v>');
    expect(text).toContain('<t xml:space="preserve"></t>');
  });
});
