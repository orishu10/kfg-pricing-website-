export const formatNumber = (value: string | number | null | undefined): string => {
  if (value == null || value === '') return '';
  const str = String(value);
  const negative = str.startsWith('-');
  const unsigned = negative ? str.slice(1) : str;
  const [intPart, decPart] = unsigned.split('.');
  if (!/^\d+$/.test(intPart)) return str;
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}${withCommas}${decPart !== undefined ? `.${decPart}` : ''}`;
};

export const partyLabel = (
  shortName: string | null | undefined,
  fullName: string | null | undefined,
): string => (shortName ?? '').trim() || (fullName ?? '').trim();

export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};
