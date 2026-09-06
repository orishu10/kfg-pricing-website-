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
