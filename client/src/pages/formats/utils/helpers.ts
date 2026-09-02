import {
  SHIPMENT_SECTIONS, type ShipmentSelectableKey, type ShipmentSectionSpec,
} from '../../logistics/weeklyShipments/utils/consts';

export type SectionSelection = 'all' | 'some' | 'none';

export const toggleField = (fields: ShipmentSelectableKey[], key: ShipmentSelectableKey) =>
  fields.includes(key) ? fields.filter((field) => field !== key) : [...fields, key];

export const sectionKeys = (section: ShipmentSectionSpec) => section.fields.map((field) => field.key);

export const sectionSelection = (
  fields: ShipmentSelectableKey[],
  section: ShipmentSectionSpec,
): SectionSelection => {
  const keys = sectionKeys(section);
  const picked = keys.filter((key) => fields.includes(key)).length;
  if (picked === 0) return 'none';
  return picked === keys.length ? 'all' : 'some';
};

export const toggleSection = (fields: ShipmentSelectableKey[], section: ShipmentSectionSpec) => {
  const keys = sectionKeys(section);
  if (sectionSelection(fields, section) === 'all') {
    return fields.filter((field) => !keys.includes(field));
  }
  return [...fields.filter((field) => !keys.includes(field)), ...keys];
};

export const orderedFields = (fields: ShipmentSelectableKey[]) =>
  SHIPMENT_SECTIONS.flatMap((section) => sectionKeys(section)).filter((key) => fields.includes(key));

export const sectionSummary = (fields: string[]) =>
  SHIPMENT_SECTIONS
    .map((section) => {
      const picked = sectionKeys(section).filter((key) => fields.includes(key)).length;
      return picked > 0 ? `${section.label} (${picked})` : '';
    })
    .filter(Boolean)
    .join(', ');
