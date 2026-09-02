import type { LookupCategory, ShipmentDocumentRow } from '../../../../api';

export const SHIPMENT_FIELD_KEYS = [
  'route', 'status',
  'customer', 'customer_incoterms', 'description', 'supplier_incoterms',
  'loading_place', 'loading_date', 'trucking_company', 'pup', 'pol', 'pod',
  'con', 'container_number', 'shipping_line', 'seal_number', 'etd', 'mbl_number',
  'eta', 'temp_logger', 'booking', 'temperature', 'tfc_reference', 'export_release',
  'schedule_id', 'vessel', 'voyage', 'booked',
  'isf', 'bl', 'export_entry', 'trucking_invoice', 'sea_freight_invoice',
  'fob_charge', 'cif_charge', 'bl_manifest', 'bl_credit', 'additional_ees',
  'reserve', 'drop_container', 'warehouse_208', 'trucking_charge', 'extras',
] as const;

export type ShipmentFieldKey = (typeof SHIPMENT_FIELD_KEYS)[number];

export const SHIPMENT_ROW_KEYS = ['purchase_orders', 'invoices', 'packing_lists'] as const;

export type ShipmentRowKey = (typeof SHIPMENT_ROW_KEYS)[number];

export type ShipmentHeaderKey = 'route' | 'status';

export type ShipmentSelectableKey =
  | Exclude<ShipmentFieldKey, ShipmentHeaderKey>
  | ShipmentRowKey
  | 'suppliers';

export type ShipmentForm = Record<ShipmentFieldKey, string> &
  Record<ShipmentRowKey, ShipmentDocumentRow[]> & { suppliers: string[] };

export type ShipmentControl =
  | 'text' | 'date' | 'checkbox' | 'lookup'
  | 'customer' | 'supplierList' | 'schedule' | 'payer' | 'documentRows';

export interface ShipmentDocumentColumn {
  key: keyof ShipmentDocumentRow;
  label: string;
  type?: string;
}

export interface ShipmentFieldSpec {
  key: ShipmentSelectableKey;
  label: string;
  control: ShipmentControl;
  lookup?: LookupCategory;
  unit?: string;
  fullWidth?: boolean;
  newRow?: boolean;
  addLabel?: string;
  columns?: ShipmentDocumentColumn[];
}

export interface ShipmentSectionSpec {
  key: string;
  label: string;
  fields: ShipmentFieldSpec[];
}

export const SHIPMENT_SECTIONS: ShipmentSectionSpec[] = [
  {
    key: 'parties',
    label: 'Supplier - Customer',
    fields: [
      { key: 'customer', label: 'Customer', control: 'customer' },
      { key: 'customer_incoterms', label: 'Customer Incoterms', control: 'lookup', lookup: 'incoterms' },
      { key: 'description', label: 'Description', control: 'text', fullWidth: true },
      { key: 'supplier_incoterms', label: 'Supplier Incoterms', control: 'lookup', lookup: 'incoterms', newRow: true },
      { key: 'suppliers', label: 'Suppliers', control: 'supplierList' },
    ],
  },
  {
    key: 'loading',
    label: 'Loading',
    fields: [
      { key: 'loading_place', label: 'Loading Place / Pickup', control: 'text' },
      { key: 'loading_date', label: 'Loading Date', control: 'date' },
      { key: 'trucking_company', label: 'Trucking Company', control: 'text' },
      { key: 'pup', label: 'PUP', control: 'text' },
      { key: 'pol', label: 'POL', control: 'lookup', lookup: 'sea_port' },
      { key: 'pod', label: 'POD', control: 'lookup', lookup: 'sea_port' },
    ],
  },
  {
    key: 'container',
    label: 'Container',
    fields: [
      { key: 'con', label: 'Container Type', control: 'lookup', lookup: 'container' },
      { key: 'container_number', label: 'Container #', control: 'text' },
      { key: 'shipping_line', label: 'Shipping Line', control: 'lookup', lookup: 'shipping_line' },
      { key: 'seal_number', label: 'Seal #', control: 'text' },
      { key: 'etd', label: 'ETD', control: 'date' },
      { key: 'mbl_number', label: 'MBL #', control: 'text' },
      { key: 'eta', label: 'ETA', control: 'date' },
      { key: 'temp_logger', label: 'Temp. Logger', control: 'text' },
      { key: 'booking', label: 'Booking', control: 'text' },
      { key: 'temperature', label: 'Temperature', control: 'text', unit: '°C' },
      { key: 'tfc_reference', label: 'TFC Reference', control: 'text' },
      { key: 'export_release', label: 'Export Release', control: 'text' },
      { key: 'schedule_id', label: 'Schedule', control: 'schedule', fullWidth: true },
      { key: 'vessel', label: 'Vessel', control: 'text' },
      { key: 'voyage', label: 'Voyage', control: 'text' },
      { key: 'booked', label: 'Booked', control: 'checkbox' },
    ],
  },
  {
    key: 'documents',
    label: 'Documents',
    fields: [
      {
        key: 'purchase_orders',
        label: 'Purchase Orders',
        control: 'documentRows',
        fullWidth: true,
        addLabel: 'Add PO',
        columns: [
          { key: 'number', label: 'PO Number' },
          { key: 'date', label: 'PO Date', type: 'date' },
        ],
      },
      {
        key: 'invoices',
        label: 'Invoices',
        control: 'documentRows',
        fullWidth: true,
        addLabel: 'Add INV',
        columns: [
          { key: 'number', label: 'INV Number' },
          { key: 'date', label: 'INV Date', type: 'date' },
          { key: 'file', label: 'INV Document' },
          { key: 'amount', label: 'INV Amount' },
        ],
      },
      {
        key: 'packing_lists',
        label: 'Packing Lists',
        control: 'documentRows',
        fullWidth: true,
        addLabel: 'Add PL',
        columns: [
          { key: 'number', label: 'PL Number' },
          { key: 'file', label: 'PL Document' },
        ],
      },
      { key: 'isf', label: 'ISF', control: 'text' },
      { key: 'bl', label: 'BL', control: 'text' },
      { key: 'export_entry', label: 'Export Entry', control: 'text' },
      { key: 'trucking_invoice', label: 'Trucking INV', control: 'text' },
      { key: 'sea_freight_invoice', label: 'Sea Freight INV', control: 'text' },
    ],
  },
  {
    key: 'expenses',
    label: 'Expenses',
    fields: [
      { key: 'fob_charge', label: 'FOB Charges', control: 'payer' },
      { key: 'cif_charge', label: 'CIF Charges', control: 'payer' },
      { key: 'bl_manifest', label: 'BL Manifest', control: 'checkbox' },
      { key: 'bl_credit', label: 'BL Credit (1/2 Containers)', control: 'text' },
      { key: 'additional_ees', label: 'Additional EEs', control: 'text' },
      { key: 'reserve', label: 'Reserve', control: 'text' },
      { key: 'drop_container', label: 'Drop Container', control: 'text', unit: '₪' },
      { key: 'warehouse_208', label: 'Warehouse 208', control: 'text', unit: '₪' },
      { key: 'trucking_charge', label: 'Trucking Charge', control: 'text', unit: '₪' },
      { key: 'extras', label: 'Extras', control: 'text', fullWidth: true },
    ],
  },
];

export const EMPTY_DOCUMENT_ROW: ShipmentDocumentRow = { number: '', date: '', amount: '', file: '' };

export const EMPTY_SHIPMENT: ShipmentForm = {
  ...(Object.fromEntries(SHIPMENT_FIELD_KEYS.map((key) => [key, ''])) as Record<ShipmentFieldKey, string>),
  suppliers: [''],
  purchase_orders: [{ ...EMPTY_DOCUMENT_ROW }],
  invoices: [{ ...EMPTY_DOCUMENT_ROW }],
  packing_lists: [{ ...EMPTY_DOCUMENT_ROW }],
};

export const SHIPMENT_STATUS_OPTIONS = [
  'Booking', 'Loading', 'Sailed', 'Arrived', 'Delivered', 'Closed',
];

export const CHARGE_PAYER_OPTIONS = ['KFG', 'Customer', 'Supplier'];

export const SHIPMENT_DATE_KEYS = ['loading_date', 'etd', 'eta'] as const;

export const ALL_FIELDS_FORMAT_NAME = 'All fields';
