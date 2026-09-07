import {
  EMPTY_DOCUMENT_ROW, EMPTY_SHIPMENT, SHIPMENT_DATE_KEYS, SHIPMENT_FIELD_KEYS,
  SHIPMENT_SECTIONS,
  type ShipmentFieldKey, type ShipmentFieldSpec, type ShipmentForm, type ShipmentRowKey,
  type ShipmentSectionSpec, type ShipmentSelectableKey,
} from './consts';
import { formatDate } from '../../../../utils/time';
import { isoWeek } from '../../utils/week';
import type {
  Schedule, ShipmentDocumentRow, ShipmentFormat, WeeklyShipment, WeeklyShipmentInput,
} from '../../../../api';

const toDocumentRows = (value: unknown): ShipmentDocumentRow[] => {
  const rows = Array.isArray(value) ? (value as Partial<ShipmentDocumentRow>[]) : [];
  const filled = rows.map((row) => ({ ...EMPTY_DOCUMENT_ROW, ...row }));
  return filled.length > 0 ? filled : [{ ...EMPTY_DOCUMENT_ROW }];
};

const isEmptyRow = (row: ShipmentDocumentRow) =>
  !row.number.trim() && !row.date.trim() && !row.amount.trim() && !row.file.trim();

export const shipmentToForm = (shipment: WeeklyShipment): ShipmentForm => {
  const form = { ...EMPTY_SHIPMENT };
  SHIPMENT_FIELD_KEYS.forEach((key) => {
    const value = (shipment as unknown as Record<string, unknown>)[key];
    form[key] = value == null ? '' : String(value);
  });
  SHIPMENT_DATE_KEYS.forEach((key) => {
    form[key] = form[key] ? form[key].slice(0, 10) : '';
  });
  form.booked = shipment.booked ? 'true' : '';
  form.bl_manifest = shipment.bl_manifest ? 'true' : '';
  form.suppliers = shipment.suppliers?.length ? [...shipment.suppliers] : [''];
  form.purchase_orders = toDocumentRows(shipment.purchase_orders);
  form.invoices = toDocumentRows(shipment.invoices);
  form.packing_lists = toDocumentRows(shipment.packing_lists);
  return form;
};

export const formToInput = (form: ShipmentForm, formatId: number | null): WeeklyShipmentInput => {
  const fields = Object.fromEntries(
    SHIPMENT_FIELD_KEYS.map((key) => [key, form[key]]),
  ) as Record<ShipmentFieldKey, string>;

  return {
    ...fields,
    format_id: formatId,
    booked: form.booked === 'true',
    bl_manifest: form.bl_manifest === 'true',
    suppliers: form.suppliers.map((supplier) => supplier.trim()).filter(Boolean),
    purchase_orders: form.purchase_orders.filter((row) => !isEmptyRow(row)),
    invoices: form.invoices.filter((row) => !isEmptyRow(row)),
    packing_lists: form.packing_lists.filter((row) => !isEmptyRow(row)),
  };
};

export const appendRow = (rows: ShipmentDocumentRow[]) => [...rows, { ...EMPTY_DOCUMENT_ROW }];

export const updateRow = (
  rows: ShipmentDocumentRow[],
  index: number,
  key: keyof ShipmentDocumentRow,
  value: string,
) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row));

export const removeRow = (rows: ShipmentDocumentRow[], index: number) =>
  rows.length > 1 ? rows.filter((_, i) => i !== index) : [{ ...EMPTY_DOCUMENT_ROW }];

export const appendValue = (values: string[]) => [...values, ''];

export const updateValue = (values: string[], index: number, value: string) =>
  values.map((current, i) => (i === index ? value : current));

export const removeValue = (values: string[], index: number) =>
  values.length > 1 ? values.filter((_, i) => i !== index) : [''];

export const scheduleSummary = (schedule?: Schedule) => {
  if (!schedule) return [];
  const heading = [
    schedule.vessel,
    schedule.voyage && `Voyage ${schedule.voyage}`,
    schedule.tt && `TT ${schedule.tt}`,
  ].filter(Boolean).join(', ');

  return [
    heading,
    schedule.ddl_con && `Deadline CON # ${schedule.ddl_con}`,
    schedule.ddl_docs && `Deadline Docs ${schedule.ddl_docs}`,
    schedule.ddl_port && `Deadline Port ${schedule.ddl_port}`,
  ].filter((line): line is string => Boolean(line));
};

export const visibleSections = (fields: ShipmentSelectableKey[] | null) =>
  SHIPMENT_SECTIONS
    .map((section) => ({
      ...section,
      fields: fields ? section.fields.filter((field) => fields.includes(field.key)) : section.fields,
    }))
    .filter((section) => section.fields.length > 0);

export const formatFields = (format: ShipmentFormat | null): ShipmentSelectableKey[] | null =>
  format ? (format.fields as ShipmentSelectableKey[]) : null;

export const fieldGridColumn = (spec: ShipmentFieldSpec) => {
  if (spec.fullWidth) return '1 / -1';
  return spec.newRow ? '1' : 'auto';
};

export const isFieldFilled = (form: ShipmentForm, spec: ShipmentFieldSpec): boolean => {
  if (spec.control === 'supplierList') return form.suppliers.some((supplier) => supplier.trim() !== '');
  if (spec.control === 'documentRows') return form[spec.key as ShipmentRowKey].some((row) => !isEmptyRow(row));
  return form[spec.key as ShipmentFieldKey].trim() !== '';
};

export const sectionFieldCounts = (sections: ShipmentSectionSpec[], form: ShipmentForm) =>
  sections.map((section) => ({
    key: section.key,
    label: section.label,
    total: section.fields.length,
    filled: section.fields.filter((spec) => isFieldFilled(form, spec)).length,
  }));

export interface ShipmentSummaryCell {
  label: string;
  value: string;
}

export const shipmentSummary = (form: ShipmentForm): ShipmentSummaryCell[] => [
  { label: 'Customer', value: form.customer },
  { label: 'Suppliers', value: form.suppliers.filter((supplier) => supplier.trim()).join(', ') },
  { label: 'Lane', value: [form.pup || form.pol, form.pod].filter(Boolean).join(' → ') },
  { label: 'Vessel', value: [form.vessel, form.voyage ? `V.${form.voyage}` : ''].filter(Boolean).join(' · ') },
  { label: 'ETD → ETA', value: [formatDate(form.etd), formatDate(form.eta)].filter(Boolean).join(' → ') },
];

export const shipmentEyebrow = (form: ShipmentForm, isEdit: boolean): string => {
  if (!form.etd) return isEdit ? 'Shipment' : 'New shipment';
  const etd = new Date(form.etd);
  if (Number.isNaN(etd.getTime())) return isEdit ? 'Shipment' : 'New shipment';
  return `Week ${isoWeek(etd)} · ETD ${formatDate(form.etd)}`;
};

export const formatUsageCounts = (shipments: WeeklyShipment[]): Record<string, number> => {
  const counts: Record<string, number> = {};
  shipments.forEach((shipment) => {
    const key = shipment.format_id == null ? 'all' : String(shipment.format_id);
    counts[key] = (counts[key] ?? 0) + 1;
  });
  return counts;
};
